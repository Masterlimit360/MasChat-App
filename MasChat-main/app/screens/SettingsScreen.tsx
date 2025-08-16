import { Entypo, Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from 'expo-blur';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, StatusBar, Platform, Alert, useColorScheme } from "react-native";
import { useTheme } from '../context/ThemeContext';

// Modern Color Palette matching the app's theme
const COLORS = {
  light: {
    primary: '#4361EE',    // Vibrant Blue
    secondary: '#3A0CA3',  // Deep Purple
    accent: '#FF7F11',     // Orange
    background: '#F8F9FA',  // Light Gray
    card: '#FFFFFF',       // White
    text: '#212529',       // Dark Gray
    lightText: '#6C757D',  // Medium Gray
    border: '#E9ECEF',     // Light Border
    success: '#4CC9F0',    // Teal
    dark: '#1A1A2E',       // Dark Blue
    tabBarBg: 'rgba(255, 255, 255, 0.95)',
    tabBarBorder: 'rgba(0, 0, 0, 0.1)',
  },
  dark: {
    primary: '#4361EE',    // Vibrant Blue
    secondary: '#3A0CA3',  // Deep Purple
    accent: '#FF7F11',     // Orange
    background: '#1A1A2E', // Match marketplace dark background
    card: '#2D2D44',       // Match marketplace dark card
    text: '#FFFFFF',       // White
    lightText: '#B0B0B0',  // Light Gray
    border: '#404040',     // Match marketplace dark border
    success: '#4CC9F0',    // Teal
    dark: '#1A1A2E',       // Dark Blue
    tabBarBg: 'rgba(26, 26, 46, 0.95)',
    tabBarBorder: 'rgba(255, 255, 255, 0.1)',
  },
};

export default function SettingsScreen() {
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { themeMode, currentTheme, setThemeMode } = useTheme();
  const colorScheme = useColorScheme();
  const colors = COLORS[currentTheme === 'dark' ? 'dark' : 'light'];
  const currentColors = colors;

  const getThemeIcon = () => {
    switch (themeMode) {
      case 'light':
        return <Ionicons name="sunny" size={22} color="#FFD700" />;
      case 'dark':
        return <Ionicons name="moon" size={22} color="#8B5CF6" />;
      case 'system':
        return <Ionicons name="settings" size={22} color="#10B981" />;
      default:
        return <Ionicons name="settings" size={22} color="#10B981" />;
    }
  };

  const getThemeLabel = () => {
    switch (themeMode) {
      case 'light':
        return 'Light Mode';
      case 'dark':
        return 'Dark Mode';
      case 'system':
        return 'System Theme';
      default:
        return 'Theme';
    }
  };

  const handleThemeToggle = () => {
    Alert.alert(
      'Choose Theme',
      'Select your preferred theme mode:',
      [
        {
          text: 'Light Mode',
          onPress: () => setThemeMode('light'),
          style: themeMode === 'light' ? 'default' : 'default'
        },
        {
          text: 'Dark Mode',
          onPress: () => setThemeMode('dark'),
          style: themeMode === 'dark' ? 'default' : 'default'
        },
        {
          text: 'System Preference',
          onPress: () => setThemeMode('system'),
          style: themeMode === 'system' ? 'default' : 'default'
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const settingsOptions = [
    {
      section: "Appearance",
      data: [
        { 
          icon: getThemeIcon(), 
          label: getThemeLabel(), 
          onPress: handleThemeToggle,
          showChevron: false,
          badgeText: themeMode === 'system' ? 'Auto' : themeMode === 'dark' ? 'Dark' : 'Light'
        } as any,
      ],
    },
    {
      section: "Privacy & Security",
      data: [
        { icon: <Ionicons name="lock-closed-outline" size={22} color="#3A8EFF" />, label: "Privacy Settings", route: "/screens/PrivacySettingsScreen" },
        { icon: <Ionicons name="shield-outline" size={22} color="#FF7F11" />, label: "Security Settings", route: "/screens/SecuritySettingsScreen" },
        { icon: <Ionicons name="notifications-outline" size={22} color="#5c6bc0" />, label: "Notification Settings", route: "/screens/NotificationSettingsScreen" },
      ],
    },
    {
      section: "Preferences",
      data: [
        { icon: <Feather name="sliders" size={22} color="#26a69a" />, label: "Content Preferences", route: "/screens/ContentPreferencesScreen" },
        { icon: <MaterialCommunityIcons name="emoticon-outline" size={22} color="#ffca28" />, label: "Reaction preferences" },
        { icon: <MaterialCommunityIcons name="account-outline" size={22} color="#ab47bc" />, label: "Accessibility", route: "/screens/AccessibilitySettingsScreen" },
        { icon: <Entypo name="pin" size={22} color="#66bb6a" />, label: "Tab bar" },
        { icon: <Ionicons name="globe-outline" size={22} color="#26c6da" />, label: "Language and region" },
        { icon: <Feather name="file" size={22} color="#7e57c2" />, label: "Media" },
        { icon: <Ionicons name="time-outline" size={22} color="#78909c" />, label: "Your time on Facebook" },
        { icon: <Feather name="globe" size={22} color="#8d6e63" />, label: "Browser" },
      ],
    },
    {
      section: "Support",
      data: [
        { icon: <Ionicons name="help-circle-outline" size={22} color="#ec407a" />, label: "Help & Support" },
        { icon: <MaterialCommunityIcons name="information-outline" size={22} color="#26a69a" />, label: "Terms and Policies" },
        { icon: <Ionicons name="people-outline" size={22} color="#5c6bc0" />, label: "Community Standards" },
      ],
    },
  ];

  // Filter options based on search
  const filteredOptions = settingsOptions.map(section => ({
    ...section,
    data: section.data.filter(option =>
      option.label.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(section => section.data.length > 0);

  const handleOptionPress = (option: any) => {
    if (option.onPress) {
      option.onPress();
    } else if (option.route) {
      router.push(option.route);
    } else {
      router.push('/screens/ComingSoon');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: currentColors.background }]}>
      <StatusBar backgroundColor={currentColors.primary} barStyle={currentTheme === 'dark' ? 'light-content' : 'dark-content'} translucent />
      
      {/* Modern Header */}
      <BlurView
        intensity={80}
        tint={currentTheme === 'dark' ? 'dark' : 'light'}
        style={[styles.header, { backgroundColor: currentColors.tabBarBg, borderBottomColor: currentColors.tabBarBorder }]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => {
              if (router.canGoBack?.()) {
                router.back();
              } else {
                router.replace('/(tabs)/menu');
              }
            }}
          >
            <Ionicons name="arrow-back" size={24} color={currentColors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: currentColors.text }]}>Settings & Privacy</Text>
          <View style={styles.headerSpacer} />
        </View>
      </BlurView>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: currentColors.card, borderBottomColor: currentColors.border }]}>
        <View style={[styles.searchBar, { backgroundColor: currentColors.background, borderColor: currentColors.border }]}>
          <Ionicons name="search" size={20} color={currentColors.lightText} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: currentColors.text }]}
            placeholder="Search settings"
            placeholderTextColor={currentColors.lightText}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Settings List */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredOptions.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: currentColors.lightText }]}>{section.section}</Text>
            <View style={[styles.sectionContainer, { backgroundColor: currentColors.card, borderColor: currentColors.border }]}>
              {section.data.map((option, index) => (
                <React.Fragment key={option.label}>
                  <TouchableOpacity 
                    style={styles.optionRow}
                    onPress={() => handleOptionPress(option)}
                  >
                    <View style={[styles.iconContainer, { backgroundColor: currentColors.background, borderColor: currentColors.border }]}>
                      {option.icon}
                    </View>
                    <View style={styles.optionContent}>
                      <Text style={[styles.optionLabel, { color: currentColors.text }]}>{option.label}</Text>
                      {option.badgeText && (
                        <View style={[styles.badge, { backgroundColor: currentColors.primary }]}>
                          <Text style={styles.badgeText}>{option.badgeText}</Text>
                        </View>
                      )}
                    </View>
                    {option.showChevron !== false && (
                      <Ionicons name="chevron-forward" size={20} color={currentColors.lightText} />
                    )}
                  </TouchableOpacity>
                  {index < section.data.length - 1 && <View style={[styles.optionDivider, { backgroundColor: currentColors.border }]} />}
                </React.Fragment>
              ))}
            </View>
          </View>
        ))}

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentColors.lightText }]}>Account</Text>
          <View style={[styles.sectionContainer, { backgroundColor: currentColors.card, borderColor: currentColors.border }]}>
            <TouchableOpacity style={styles.optionRow}>
              <View style={[styles.iconContainer, { backgroundColor: currentColors.background, borderColor: currentColors.border }]}>
                <Ionicons name="person-outline" size={22} color={currentColors.primary} />
              </View>
              <View style={styles.optionContent}>
                <Text style={[styles.optionLabel, { color: currentColors.text }]}>Personal Information</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={currentColors.lightText} />
            </TouchableOpacity>
            <View style={[styles.optionDivider, { backgroundColor: currentColors.border }]} />
            <TouchableOpacity style={styles.optionRow} onPress={() => {
              Alert.alert(
                'Logout',
                'Are you sure you want to logout?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Logout', style: 'destructive', onPress: () => router.replace("/login") }
                ]
              );
            }}>
              <View style={[styles.iconContainer, { backgroundColor: currentColors.background, borderColor: currentColors.border }]}>
                <Ionicons name="log-out" size={22} color="#ec407a" />
              </View>
              <View style={styles.optionContent}>
                <Text style={[styles.optionLabel, { color: '#ec407a' }]}>Log Out</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    zIndex: 1000,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSpacer: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 44,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 24,
  },
  sectionContainer: {
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
  },
  optionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  optionDivider: {
    height: 1,
    marginLeft: 68,
  },
});