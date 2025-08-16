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
};

const privacyOptions = [
  {
    id: 'profileVisibility',
    title: 'Profile Visibility',
    subtitle: 'Who can see your profile',
    icon: <Ionicons name="eye-outline" size={24} color={COLORS.primary} />,
    type: 'toggle'
  },
  {
    id: 'showOnlineStatus',
    title: 'Online Status',
    subtitle: 'Show when you\'re online',
    icon: <Ionicons name="radio-button-on-outline" size={24} color={COLORS.primary} />,
    type: 'toggle'
  },
  {
    id: 'allowFriendRequests',
    title: 'Friend Requests',
    subtitle: 'Allow others to send friend requests',
    icon: <Ionicons name="people-outline" size={24} color={COLORS.primary} />,
    type: 'toggle'
  },
  {
    id: 'allowMessagesFromNonFriends',
    title: 'Messages from Non-Friends',
    subtitle: 'Allow messages from people you don\'t know',
    icon: <Ionicons name="mail-outline" size={24} color={COLORS.primary} />,
    type: 'toggle'
  }
];

export default function PrivacySettingsScreen() {
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
      Alert.alert('Error', 'Failed to load privacy settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: boolean) => {
    if (!settings || !user) return;

    try {
      setSaving(true);
      const updatedSettings = await settingsService.updatePrivacySettings(user.id, {
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

  const renderPrivacyOption = (option: any) => {
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
        <Text style={styles.loadingText}>Loading privacy settings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" translucent />
      
      <ModernHeader
        title="Privacy Settings"
        showBackButton={true}
        onBackPress={() => {
          if (router.canGoBack?.()) {
            router.back();
          } else {
            router.replace('/(tabs)/profile');
          }
        }}
      />

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy Controls</Text>
          <Text style={styles.sectionDescription}>
            Control who can see your information and contact you
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          {privacyOptions.map((option) => renderPrivacyOption(option))}
        </View>

        {/* Additional Privacy Info */}
        <View style={styles.infoContainer}>
          <View style={styles.infoHeader}>
            <MaterialCommunityIcons name="information-outline" size={20} color={COLORS.primary} />
            <Text style={styles.infoTitle}>Privacy Tips</Text>
          </View>
          <Text style={styles.infoText}>
            • Your privacy settings help control who can see your profile and contact you{'\n'}
            • You can change these settings at any time{'\n'}
            • Some features may require certain privacy settings to be enabled
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
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
  infoContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#e3f2fd',
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
}); 