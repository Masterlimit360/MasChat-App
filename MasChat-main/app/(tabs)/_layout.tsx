import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

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
    tabBarBg: 'rgba(255, 255, 255, 0.95)',
    tabBarBorder: 'rgba(0, 0, 0, 0.1)',
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
    tabBarBg: 'rgba(26, 26, 46, 0.95)',
    tabBarBorder: 'rgba(255, 255, 255, 0.1)',
  },
};

function AnimatedTabIcon({ name, color, focused }: { name: any; color: string; focused: boolean }) {
  const scale = useSharedValue(1);
  React.useEffect(() => {
    scale.value = withTiming(focused ? 1.2 : 1, { duration: 300 });
  }, [focused]);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: focused ? 1 : 0.7,
  }));
  return (
    <Animated.View style={animatedStyle}>
      {focused && (
        <View style={{
          position: 'absolute',
          top: -8,
          left: 0,
          right: 0,
          height: 4,
          borderTopLeftRadius: 4,
          borderTopRightRadius: 4,
          backgroundColor: COLORS.light.accent,
          zIndex: 2,
        }} />
      )}
      <Ionicons name={name} color={focused ? COLORS.light.accent : color} size={28} />
    </Animated.View>
  );
}

export default function TabLayout() {
  const { currentTheme } = useTheme();
  const colors = COLORS[currentTheme === 'dark' ? 'dark' : 'light'];

  return (
    <Tabs
      screenOptions={({ route }) => {
        return {
          tabBarShowLabel: false,
          headerShown: false,
          tabBarStyle: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 80,
            backgroundColor: 'transparent',
            borderTopColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarIconStyle: {
            alignItems: 'center',
            justifyContent: 'center',
            display: 'flex',
          },
          tabBarBackground: () => (
            <BlurView
              intensity={80}
              tint={currentTheme === 'dark' ? 'dark' : 'light'}
              style={{
                flex: 1,
                backgroundColor: colors.tabBarBg,
                borderTopWidth: 0.5,
                borderTopColor: colors.tabBarBorder,
              }}
            />
          ),
        };
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name="home" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="videos"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name="videocam" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="marketplace"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name="cart" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name="notifications" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name="person-circle" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name="menu" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}