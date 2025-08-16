import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNotification } from '../context/NotificationContext';

const COLORS = {
  primary: '#3A8EFF',
  accent: '#FF7F11',
  white: '#FFFFFF',
  text: '#333333',
  lightText: '#888888',
};

const { width } = Dimensions.get('window');

export default function NotificationBanner() {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const router = useRouter();
  const { bannerVisible, bannerMessage, hideBanner } = useNotification();

  useEffect(() => {
    if (bannerVisible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [bannerVisible, slideAnim]);

  const handlePress = () => {
    router.push('/(tabs)/notifications');
    hideBanner();
  };

  if (!bannerVisible) return null;

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
      <TouchableOpacity style={styles.banner} onPress={handlePress} activeOpacity={0.8}>
        <View style={styles.content}>
          <Ionicons name="notifications" size={20} color={COLORS.white} />
          <Text style={styles.message} numberOfLines={2}>{bannerMessage}</Text>
        </View>
        <TouchableOpacity style={styles.dismissBtn} onPress={hideBanner}>
          <Ionicons name="close" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  banner: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 16,
    marginTop: 50,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  message: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  dismissBtn: {
    padding: 4,
  },
}); 