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
  Alert,
  Modal
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

const contentOptions = [
  {
    id: 'autoPlayVideos',
    title: 'Auto-play Videos',
    subtitle: 'Automatically play videos in your feed',
    icon: <Ionicons name="play-circle-outline" size={24} color={COLORS.primary} />,
    type: 'toggle'
  },
  {
    id: 'showSensitiveContent',
    title: 'Show Sensitive Content',
    subtitle: 'Display content that may be sensitive',
    icon: <Ionicons name="eye-outline" size={24} color={COLORS.primary} />,
    type: 'toggle'
  },
  {
    id: 'dataSaver',
    title: 'Data Saver',
    subtitle: 'Reduce data usage by limiting media quality',
    icon: <Ionicons name="cellular-outline" size={24} color={COLORS.primary} />,
    type: 'toggle'
  },
  {
    id: 'autoDownloadMedia',
    title: 'Auto-download Media',
    subtitle: 'Automatically download images and videos',
    icon: <Ionicons name="download-outline" size={24} color={COLORS.primary} />,
    type: 'toggle'
  }
];

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Português' },
  { code: 'ru', name: 'Русский' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'ar', name: 'العربية' },
  { code: 'hi', name: 'हिन्दी' },
];

const regions = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'CN', name: 'China' },
  { code: 'IN', name: 'India' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'AR', name: 'Argentina' },
];

export default function ContentPreferencesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showRegionModal, setShowRegionModal] = useState(false);

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
      Alert.alert('Error', 'Failed to load content preferences');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: boolean | string) => {
    if (!settings || !user) return;

    try {
      setSaving(true);
      const updatedSettings = await settingsService.updateContentPreferences(Number(user.id), {
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

  const getSettingValue = (key: string): boolean | string => {
    return settings?.[key as keyof UserSettings] as boolean | string ?? false;
  };

  const renderContentOption = (option: any) => {
    const value = getSettingValue(option.id) as boolean;
    
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

  const renderLanguageItem = (language: any) => {
    const currentLanguage = getSettingValue('language') as string;
    const isSelected = currentLanguage === language.code;
    
    return (
      <TouchableOpacity
        key={language.code}
        style={[styles.listItem, isSelected && styles.selectedItem]}
        onPress={() => {
          updateSetting('language', language.code);
          setShowLanguageModal(false);
        }}
      >
        <Text style={[styles.listItemText, isSelected && styles.selectedItemText]}>
          {language.name}
        </Text>
        {isSelected && <Ionicons name="checkmark" size={20} color={COLORS.primary} />}
      </TouchableOpacity>
    );
  };

  const renderRegionItem = (region: any) => {
    const currentRegion = getSettingValue('region') as string;
    const isSelected = currentRegion === region.code;
    
    return (
      <TouchableOpacity
        key={region.code}
        style={[styles.listItem, isSelected && styles.selectedItem]}
        onPress={() => {
          updateSetting('region', region.code);
          setShowRegionModal(false);
        }}
      >
        <Text style={[styles.listItemText, isSelected && styles.selectedItemText]}>
          {region.name}
        </Text>
        {isSelected && <Ionicons name="checkmark" size={20} color={COLORS.primary} />}
      </TouchableOpacity>
    );
  };

  const getCurrentLanguageName = () => {
    const currentLanguage = getSettingValue('language') as string;
    const language = languages.find(lang => lang.code === currentLanguage);
    return language?.name || 'English';
  };

  const getCurrentRegionName = () => {
    const currentRegion = getSettingValue('region') as string;
    const region = regions.find(reg => reg.code === currentRegion);
    return region?.name || 'United States';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading content preferences...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" translucent />
      
      <ModernHeader
        title="Content Preferences"
        showBackButton={true}
        onBackPress={() => router.back()}
      />

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Content Settings</Text>
          <Text style={styles.sectionDescription}>
            Customize how content is displayed and downloaded
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          {contentOptions.map((option, index) => (
            <View key={option.id}>
              {renderContentOption(option)}
              {index < contentOptions.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Language & Region</Text>
        </View>

        <View style={styles.preferencesContainer}>
          <TouchableOpacity 
            style={styles.preferenceItem}
            onPress={() => setShowLanguageModal(true)}
          >
            <View style={styles.preferenceContent}>
              <View style={styles.iconContainer}>
                <Ionicons name="language-outline" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.optionTitle}>Language</Text>
                <Text style={styles.optionSubtitle}>{getCurrentLanguageName()}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.lightText} />
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity 
            style={styles.preferenceItem}
            onPress={() => setShowRegionModal(true)}
          >
            <View style={styles.preferenceContent}>
              <View style={styles.iconContainer}>
                <Ionicons name="location-outline" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.optionTitle}>Region</Text>
                <Text style={styles.optionSubtitle}>{getCurrentRegionName()}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.lightText} />
          </TouchableOpacity>
        </View>

        {/* Content Tips */}
        <View style={styles.infoContainer}>
          <View style={styles.infoHeader}>
            <MaterialCommunityIcons name="information-outline" size={20} color={COLORS.primary} />
            <Text style={styles.infoTitle}>Content Tips</Text>
          </View>
          <Text style={styles.infoText}>
            • Disable auto-play to save data and battery{'\n'}
            • Data saver mode reduces media quality to save bandwidth{'\n'}
            • Language and region settings affect content recommendations{'\n'}
            • Sensitive content filters help control what you see
          </Text>
        </View>
      </ScrollView>

      {/* Language Modal */}
      <Modal
        visible={showLanguageModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Language</Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {languages.map(language => renderLanguageItem(language))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Region Modal */}
      <Modal
        visible={showRegionModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRegionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Region</Text>
              <TouchableOpacity onPress={() => setShowRegionModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {regions.map(region => renderRegionItem(region))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  preferencesContainer: {
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
  preferenceItem: {
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
  preferenceContent: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  modalList: {
    maxHeight: 400,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedItem: {
    backgroundColor: '#f0f8ff',
  },
  listItemText: {
    fontSize: 16,
    color: COLORS.text,
  },
  selectedItemText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
}); 