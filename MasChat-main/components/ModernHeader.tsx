import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, StatusBar, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../app/context/ThemeContext';
import MassCoinBalance from './MassCoinBalance';

interface ModernHeaderProps {
  title?: string;
  showBackButton?: boolean;
  showAddButton?: boolean;
  showProfileButton?: boolean;
  showMassCoinBalance?: boolean;
  onBack?: () => void;
  onSearch?: () => void;
  onMessenger?: () => void;
  onAdd?: () => void;
  onSettings?: () => void;
  onProfile?: () => void;
  notificationCount?: number;
  transparent?: boolean;
}

const COLORS = {
  light: {
    primary: '#4361EE',
    secondary: '#3A0CA3',
    accent: '#FF7F11',
    background: '#F8F9FA',
    card: '#FFFFFF',
    text: '#212529',
    lightText: '#6C757D',
    border: '#E9ECEF',
    headerBg: 'rgba(255, 255, 255, 0.95)',
    headerBorder: 'rgba(0, 0, 0, 0.1)',
  },
  dark: {
    primary: '#4361EE',
    secondary: '#3A0CA3',
    accent: '#FF7F11',
    background: '#1A1A2E',
    card: '#2D2D44',
    text: '#FFFFFF',
    lightText: '#B0B0B0',
    border: '#404040',
    headerBg: 'rgba(26, 26, 46, 0.95)',
    headerBorder: 'rgba(255, 255, 255, 0.1)',
  },
};

export default function ModernHeader({
  title,
  showBackButton = false,
  showAddButton = false,
  showProfileButton = false,
  showMassCoinBalance = false,
  onBack,
  onSearch,
  onMessenger,
  onAdd,
  onSettings,
  onProfile,
  notificationCount = 0,
  transparent = false,
}: ModernHeaderProps) {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const colors = COLORS[currentTheme === 'dark' ? 'dark' : 'light'];

  const handleBackPress = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <>
      <StatusBar
        barStyle={currentTheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <BlurView
        intensity={transparent ? 20 : 80}
        tint={currentTheme === 'dark' ? 'dark' : 'light'}
        style={[
          styles.header,
          {
            backgroundColor: transparent ? 'transparent' : colors.headerBg,
            borderBottomColor: colors.headerBorder,
          },
        ]}
      >
        <View style={styles.headerContent}>
          {/* Left Section */}
          <View style={styles.leftSection}>
            {showBackButton && (
              <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
                <Ionicons
                  name="chevron-back"
                  size={24}
                  color={colors.text}
                />
              </TouchableOpacity>
            )}
            {title ? (
              <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            ) : (
              <TouchableOpacity onPress={() => router.push('/(tabs)/home')}>
                <Text style={styles.logo}>
                  Mas<Text style={{ color: colors.accent }}>Chat</Text>
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Right Section */}
          <View style={styles.rightSection}>
            {showMassCoinBalance && (
              <MassCoinBalance size="small" />
            )}
            {showAddButton && (
              <TouchableOpacity style={styles.iconButton} onPress={onAdd}>
                <Ionicons name="add" size={24} color={colors.text} />
              </TouchableOpacity>
            )}
            {onAdd && !showAddButton && (
              <TouchableOpacity style={styles.iconButton} onPress={onAdd}>
                <Ionicons name="add" size={24} color={colors.text} />
              </TouchableOpacity>
            )}
            {onSearch && (
              <TouchableOpacity style={styles.iconButton} onPress={onSearch}>
                <Ionicons name="search" size={24} color={colors.text} />
              </TouchableOpacity>
            )}
            {onMessenger && (
              <TouchableOpacity style={styles.iconButton} onPress={onMessenger}>
                {notificationCount > 0 && (
                  <View style={[styles.badge, { backgroundColor: colors.accent }]}>
                    <Text style={styles.badgeText}>
                      {notificationCount > 99 ? '99+' : notificationCount}
                    </Text>
                  </View>
                )}
                <Ionicons name="chatbubble-ellipses" size={24} color={colors.text} />
              </TouchableOpacity>
            )}
              {showProfileButton && (
              <TouchableOpacity style={styles.iconButton} onPress={onProfile}>
                <Ionicons name="person-circle" size={24} color={colors.text} />
              </TouchableOpacity>
            )}
            {onSettings && (
              <TouchableOpacity style={styles.iconButton} onPress={onSettings}>
                <Ionicons name="settings" size={24} color={colors.text} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </BlurView>
    </>
  );
}

const styles = StyleSheet.create({
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
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4361EE',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    zIndex: 10,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
}); 