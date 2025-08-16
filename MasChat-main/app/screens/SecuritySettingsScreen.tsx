import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import ModernHeader from '../components/ModernHeader';
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

const securityOptions = [
  {
    id: 'twoFactorAuth',
    title: 'Two-Factor Authentication',
    subtitle: 'Add an extra layer of security to your account',
    icon: <Ionicons name="shield-checkmark-outline" size={24} color={COLORS.primary} />,
    type: 'toggle',
    important: true
  },
  {
    id: 'loginAlerts',
    title: 'Login Alerts',
    subtitle: 'Get notified when someone logs into your account',
    icon: <Ionicons name="warning-outline" size={24} color={COLORS.warning} />,
    type: 'toggle'
  },
  {
    id: 'sessionTimeout',
    title: 'Session Timeout',
    subtitle: 'Automatically log out after inactivity',
    icon: <Ionicons name="time-outline" size={24} color={COLORS.primary} />,
    type: 'toggle'
  }
];

const securityActions = [
  {
    id: 'changePassword',
    title: 'Change Password',
    subtitle: 'Update your account password',
    icon: <Ionicons name="key-outline" size={24} color={COLORS.primary} />,
    action: 'navigate'
  },
  {
    id: 'activeSessions',
    title: 'Active Sessions',
    subtitle: 'View and manage your active sessions',
    icon: <Ionicons name="desktop-outline" size={24} color={COLORS.primary} />,
    action: 'navigate'
  },
  {
    id: 'loginHistory',
    title: 'Login History',
    subtitle: 'Review your recent login activity',
    icon: <Ionicons name="list-outline" size={24} color={COLORS.primary} />,
    action: 'navigate'
  }
];

export default function SecuritySettingsScreen() {
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
      Alert.alert('Error', 'Failed to load security settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: boolean) => {
    if (!settings || !user) return;

    try {
      setSaving(true);
      const updatedSettings = await settingsService.updateSecuritySettings(Number(user.id), {
        [key]: value
      });
      setSettings(updatedSettings);
      
      if (key === 'twoFactorAuth' && value) {
        Alert.alert(
          'Two-Factor Authentication',
          'Two-factor authentication has been enabled. You will need to set up an authenticator app.',
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

  const handleSecurityAction = (action: any) => {
    switch (action.id) {
      case 'changePassword':
        Alert.alert('Coming Soon', 'Password change functionality will be available soon.');
        break;
      case 'activeSessions':
        Alert.alert('Coming Soon', 'Active sessions management will be available soon.');
        break;
      case 'loginHistory':
        Alert.alert('Coming Soon', 'Login history will be available soon.');
        break;
      default:
        break;
    }
  };

  const renderSecurityOption = (option: any) => {
    const value = getSettingValue(option.id);
    
    return (
      <View key={option.id} style={[styles.optionContainer, option.important && styles.importantOption]}>
        <View style={styles.optionContent}>
          <View style={[styles.iconContainer, option.important && styles.importantIcon]}>
            {option.icon}
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.optionTitle}>{option.title}</Text>
            <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
            {option.important && (
              <Text style={styles.importantText}>Recommended for enhanced security</Text>
            )}
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

  const renderSecurityAction = (action: any) => {
    return (
      <TouchableOpacity 
        key={action.id} 
        style={styles.actionContainer}
        onPress={() => handleSecurityAction(action)}
      >
        <View style={styles.actionContent}>
          <View style={styles.iconContainer}>
            {action.icon}
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.optionTitle}>{action.title}</Text>
            <Text style={styles.optionSubtitle}>{action.subtitle}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.lightText} />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading security settings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" translucent />
      
      <ModernHeader
        title="Security Settings"
        showBackButton={true}
        onBackPress={() => router.back()}
      />

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security Features</Text>
          <Text style={styles.sectionDescription}>
            Protect your account with advanced security features
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          {securityOptions.map((option, index) => (
            <View key={option.id}>
              {renderSecurityOption(option)}
              {index < securityOptions.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Security</Text>
        </View>

        <View style={styles.actionsContainer}>
          {securityActions.map((action, index) => (
            <View key={action.id}>
              {renderSecurityAction(action)}
              {index < securityActions.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        {/* Security Tips */}
        <View style={styles.infoContainer}>
          <View style={styles.infoHeader}>
            <MaterialCommunityIcons name="shield-alert-outline" size={20} color={COLORS.warning} />
            <Text style={styles.infoTitle}>Security Tips</Text>
          </View>
          <Text style={styles.infoText}>
            • Enable two-factor authentication for enhanced security{'\n'}
            • Use a strong, unique password{'\n'}
            • Regularly review your login activity{'\n'}
            • Keep your app updated to the latest version
          </Text>
        </View>
      </ScrollView>
    </View>
  );
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
  actionsContainer: {
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
  importantOption: {
    backgroundColor: '#fff8e1',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionContent: {
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
  importantIcon: {
    backgroundColor: '#fff3cd',
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
  importantText: {
    fontSize: 12,
    color: COLORS.warning,
    fontWeight: '500',
    marginTop: 4,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 16,
  },
  infoContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
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
}); 