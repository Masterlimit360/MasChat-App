import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Easing } from 'react-native';
import { Image } from 'expo-image';

const { width, height } = Dimensions.get('window');

const COLORS = {
  primary: '#4361EE',
  accent: '#FF7F11',
  secondary: '#3A0CA3',
  white: '#FFFFFF',
  background: '#1A1A2E',
};

export default function LoadingScreen() {
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Start pulse animation after logo appears
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, 1000);

    // Fade in text
    setTimeout(() => {
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }, 1200);
  }, []);

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <View style={styles.background} />
      
      {/* Logo with animations */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            transform: [
              { scale: logoScale },
              { scale: pulseAnimation }
            ],
            opacity: logoOpacity,
          },
        ]}
      >
        <Image
          source={require('../../assets/GROUP 88-MasChat.png')}
          style={styles.logo}
          contentFit="contain"
        />
      </Animated.View>

      {/* App title */}
      <Animated.Text style={[styles.title, { opacity: textOpacity }]}>
        Mas<Text style={styles.accent}>Chat</Text>
      </Animated.Text>

      {/* Loading text */}
      <Animated.Text style={[styles.loadingText, { opacity: textOpacity }]}>
        Loading...
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.background,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  logo: {
    width: width * 0.4,
    height: width * 0.4,
  },
  title: {
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: 2,
    color: COLORS.white,
    textShadowOffset: { width: 2, height: 4 },
    textShadowRadius: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    marginBottom: 8,
  },
  accent: {
    color: COLORS.accent,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
    opacity: 0.8,
  },
}); 