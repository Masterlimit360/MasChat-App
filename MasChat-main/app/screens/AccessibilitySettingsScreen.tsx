import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  Platform,
  Switch,
  Alert
} from "react-native";
import { useAuth } from '../context/AuthContext';
import { settingsService, UserSettings } from '../lib/services/settingsService';

// Color Palette
const COLORS = {
  primary: '#3A8EFF',
  accent: '#FF7F11',
  background: '#F5F7FA',
  white: '#FFFFFF',
  text: '#333333',
  lightText: '#888888',
  danger: '#FF4444',
  success: '#4CAF50',
  warning: '#FF9800',
};

const accessibilityOptions = [
  {
    id: 'highContrastMode',
    title: 'High Contrast Mode',
    subtitle: 'Increase contrast for better visibility',
    icon: <Ionicons name="contrast-outline" size={24} color={COLORS.primary} />,
    type: 'toggle'
  },
  {
    id: 'largeText',
    title: 'Large Text',
    subtitle: 'Increase text size for better readability',
    icon: <Ionicons name="text-outline" size={24} color={COLORS.primary} />,
    type: 'toggle'
  },
  {
    id: 'screenReader',
    title: 'Screen Reader Support',
    subtitle: 'Enable screen reader compatibility',
    icon: <MaterialCommunityIcons name="account-eye" size={24} color={COLORS.primary} />,
    type: 'toggle'
  }
];

const accessibilityFeatures = [
  {
    id: 'reducedMotion',
    title: 'Reduce Motion',
    subtitle: 'Reduce animations and motion effects',
    icon: <Ionicons name="move-outline" size={24} color={COLORS.primary} />,
    action: 'toggle'
  },
  {
    id: 'boldText',
    title: 'Bold Text',
    subtitle: 'Make text bold for better visibility',
    icon: <Ionicons name="text" size={24} color={COLORS.primary} />,
    action: 'toggle'
  },
  {
    id: 'increaseContrast',
    title: 'Increase Contrast',
    subtitle: 'Enhance color contrast throughout the app',
    icon: <Ionicons name="color-palette-outline" size={24} color={COLORS.primary} />,
    action: 'toggle'
  }
];

export default function AccessibilitySettingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userSettings = await settingsService.getUserSettings(Number(user.id));
      setSettings(userSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
      Alert.alert('Error', 'Failed to load accessibility settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: boolean) => {
    if (!settings || !user) return;

    try {
      setSaving(true);
      const updatedSettings = await settingsService.updateAccessibilitySettings(Number(user.id), {
        [key]: value
      });
      setSettings(updatedSettings);
      
      if (key === 'largeText' && value) {
        Alert.alert(
          'Large Text Enabled',
          'Text size has been increased. You may need to restart the app for changes to take full effect.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error updating setting:', error);
      Alert.alert('Error', 'Failed to update setting');
    } finally {
      setSaving(false);
    }
  };

  const getSettingValue = (key: string): boolean => {
    return settings?.[key as keyof UserSettings] as boolean ?? false;
  };

  const handleAccessibilityAction = (action: any) => {
    Alert.alert('Coming Soon', `${action.title} will be available soon.`);
  };

  const renderAccessibilityOption = (option: any) => {
    const value = getSettingValue(option.id);
    
    return (
      <View key={option.id} style={styles.optionContainer}>
        <View style={styles.optionContent}>
          <View style={styles.iconContainer}>
            {option.icon}
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.optionTitle}>{option.title}</Text>
            <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
          </View>
        </View>
        <Switch
          value={value}
          onValueChange={(newValue) => updateSetting(option.id, newValue)}
          disabled={saving}
          thumbColor={value ? COLORS.primary : "#f4f3f4"}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
        />
      </View>
    );
  };

  const renderAccessibilityFeature = (feature: any) => {
    return (
      <TouchableOpacity 
        key={feature.id} 
        style={styles.featureContainer}
        onPress={() => handleAccessibilityAction(feature)}
      >
        <View style={styles.featureContent}>
          <View style={styles.iconContainer}>
            {feature.icon}
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.optionTitle}>{feature.title}</Text>
            <Text style={styles.optionSubtitle}>{feature.subtitle}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.lightText} />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading accessibility settings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" translucent />
      
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, '#2B6CD9']}
        style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 0) + 10 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.headerIcon}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Accessibility</Text>
        <View style={styles.headerIcon} />
      </LinearGradient>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accessibility Features</Text>
          <Text style={styles.sectionDescription}>
            Customize the app to make it more accessible for your needs
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          {accessibilityOptions.map((option, index) => (
            <View key={option.id}>
              {renderAccessibilityOption(option)}
              {index < accessibilityOptions.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Features</Text>
        </View>

        <View style={styles.featuresContainer}>
          {accessibilityFeatures.map((feature, index) => (
            <View key={feature.id}>
              {renderAccessibilityFeature(feature)}
              {index < accessibilityFeatures.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        {/* Accessibility Info */}
        <View style={styles.infoContainer}>
          <View style={styles.infoHeader}>
            <MaterialCommunityIcons name="account-eye" size={20} color={COLORS.primary} />
            <Text style={styles.infoTitle}>Accessibility Tips</Text>
          </View>
          <Text style={styles.infoText}>
            • Enable features that help you use the app more comfortably{'\n'}
            • High contrast mode can help with visual impairments{'\n'}
            • Large text makes content easier to read{'\n'}
            • Screen reader support helps with navigation
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.quickActionsTitle}>Quick Actions</Text>
          <View style={styles.quickActionsRow}>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => {
                // Enable all accessibility features
                const allSettings = accessibilityOptions.reduce((acc, option) => {
                  acc[option.id] = true;
                  return acc;
                }, {} as any);
                updateAllSettings(allSettings);
              }}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.success} />
              <Text style={styles.quickActionText}>Enable All</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => {
                // Disable all accessibility features
                const allSettings = accessibilityOptions.reduce((acc, option) => {
                  acc[option.id] = false;
                  return acc;
                }, {} as any);
                updateAllSettings(allSettings);
              }}
            >
              <Ionicons name="close-circle-outline" size={20} color={COLORS.danger} />
              <Text style={styles.quickActionText}>Disable All</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );

  async function updateAllSettings(allSettings: any) {
    if (!settings || !user) return;

    try {
      setSaving(true);
      const updatedSettings = await settingsService.updateAccessibilitySettings(Number(user.id), allSettings);
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Error updating all settings:', error);
      Alert.alert('Error', 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.text,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  headerIcon: {
    width: 40,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingTop: 16,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: COLORS.lightText,
    lineHeight: 20,
  },
  optionsContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featuresContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  featureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 14,
    color: COLORS.lightText,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 16,
  },
  infoContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#e8f4fd',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  quickActionsContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginLeft: 6,
  },
}); 