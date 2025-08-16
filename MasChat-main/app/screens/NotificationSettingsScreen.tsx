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
};

const notificationOptions = [
  {
    id: 'pushNotifications',
    title: 'Push Notifications',
    subtitle: 'Receive notifications on your device',
    icon: <Ionicons name="notifications-outline" size={24} color={COLORS.primary} />,
    type: 'toggle'
  },
  {
    id: 'emailNotifications',
    title: 'Email Notifications',
    subtitle: 'Receive notifications via email',
    icon: <Ionicons name="mail-outline" size={24} color={COLORS.primary} />,
    type: 'toggle'
  },
  {
    id: 'friendRequestNotifications',
    title: 'Friend Request Notifications',
    subtitle: 'Get notified when someone sends a friend request',
    icon: <Ionicons name="people-outline" size={24} color={COLORS.primary} />,
    type: 'toggle'
  },
  {
    id: 'messageNotifications',
    title: 'Message Notifications',
    subtitle: 'Get notified when you receive new messages',
    icon: <Ionicons name="chatbubble-outline" size={24} color={COLORS.primary} />,
    type: 'toggle'
  },
  {
    id: 'postNotifications',
    title: 'Post Notifications',
    subtitle: 'Get notified about new posts from friends',
    icon: <Ionicons name="newspaper-outline" size={24} color={COLORS.primary} />,
    type: 'toggle'
  },
  {
    id: 'marketplaceNotifications',
    title: 'Marketplace Notifications',
    subtitle: 'Get notified about marketplace activities',
    icon: <MaterialCommunityIcons name="store-outline" size={24} color={COLORS.primary} />,
    type: 'toggle'
  }
];

export default function NotificationSettingsScreen() {
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
    try {
      setLoading(true);
      const userSettings = await settingsService.getUserSettings(user.id);
      setSettings(userSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
      Alert.alert('Error', 'Failed to load notification settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: boolean) => {
    if (!settings || !user) return;

    try {
      setSaving(true);
      const updatedSettings = await settingsService.updateNotificationSettings(user.id, {
        [key]: value
      });
      setSettings(updatedSettings);
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

  const renderNotificationOption = (option: any) => {
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading notification settings...</Text>
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
        <Text style={styles.headerTitle}>Notification Settings</Text>
        <View style={styles.headerIcon} />
      </LinearGradient>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Preferences</Text>
          <Text style={styles.sectionDescription}>
            Choose what notifications you want to receive and how you want to receive them
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          {notificationOptions.map((option, index) => (
            <View key={option.id}>
              {renderNotificationOption(option)}
              {index < notificationOptions.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        {/* Notification Tips */}
        <View style={styles.infoContainer}>
          <View style={styles.infoHeader}>
            <MaterialCommunityIcons name="lightbulb-outline" size={20} color={COLORS.primary} />
            <Text style={styles.infoTitle}>Notification Tips</Text>
          </View>
          <Text style={styles.infoText}>
            • You can customize notifications for different activities{'\n'}
            • Disable notifications you don't want to reduce distractions{'\n'}
            • Some notifications are important for security and account activity
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.quickActionsTitle}>Quick Actions</Text>
          <View style={styles.quickActionsRow}>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => {
                // Enable all notifications
                const allSettings = notificationOptions.reduce((acc, option) => {
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
                // Disable all notifications
                const allSettings = notificationOptions.reduce((acc, option) => {
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
      const updatedSettings = await settingsService.updateNotificationSettings(user.id, allSettings);
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
  optionContainer: {
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
    backgroundColor: '#e8f5e8',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
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