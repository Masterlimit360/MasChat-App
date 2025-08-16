import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View, Image, Text, Dimensions, Easing, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import * as Font from 'expo-font';
import { Asset } from 'expo-asset';

const { width, height } = Dimensions.get('window');

const COLORS = {
  light: {
    primary: '#0A2463',
    accent: '#FF7F11',
    background: '#F5F7FA',
    white: '#FFFFFF',
    secondary: '#3E92CC',
    dark: '#1A1A2E',
    text: '#333333',
    lightText: '#666666',
  },
  dark: {
    primary: '#0A2463',
    accent: '#FF7F11',
    background: '#1A1A2E',
    white: '#FFFFFF',
    secondary: '#3E92CC',
    dark: '#0F0F1A',
    text: '#FFFFFF',
    lightText: '#B0B0B0',
  },
};

export default function SplashScreen() {
  const router = useRouter();
  const { user, token, isLoading } = useAuth();
  const colorScheme = useColorScheme();
  const colors = COLORS[colorScheme === 'dark' ? 'dark' : 'light'];
  
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // Animation refs
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const mottoOpacity = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0)).current;
  const ringOpacity = useRef(new Animated.Value(0.6)).current;

  // Load assets and fonts
  useEffect(() => {
    const loadAssets = async () => {
      try {
        // Load images
        await Asset.loadAsync([
          require('../../assets/GROUP 88-MasChat.png'),
          require('../../assets/images/icon.png'),
          require('../../assets/images/splash-icon.png'),
        ]);

        // Load fonts (if you have custom fonts)
        await Font.loadAsync({
          'Helvetica Neue': require('../../assets/fonts/SpaceMono-Regular.ttf'),
        });

        setAssetsLoaded(true);
        setFontsLoaded(true);
      } catch (error) {
        console.log('Error loading assets:', error);
        // Continue anyway if assets fail to load
        setAssetsLoaded(true);
        setFontsLoaded(true);
      }
    };

    loadAssets();
  }, []);

  // Handle navigation after loading
  useEffect(() => {
    if (!isLoading && assetsLoaded && fontsLoaded) {
      // Add a small delay to show the splash screen
      const timer = setTimeout(() => {
        if (user && token) {
          console.log('User is authenticated, redirecting to home');
          router.replace('/(tabs)/home');
        } else {
          console.log('User not authenticated, redirecting to login');
          router.replace('/(auth)/login');
        }
      }, 2000); // Show splash for at least 2 seconds

      return () => clearTimeout(timer);
    }
  }, [user, token, isLoading, assetsLoaded, fontsLoaded, router]);

  useEffect(() => {
    // Start animations when assets are loaded
    if (assetsLoaded && fontsLoaded) {
      // Animation sequence
      Animated.parallel([
        // Ring connection animation
        Animated.sequence([
          Animated.delay(300),
          Animated.parallel([
            Animated.timing(ringScale, {
              toValue: 1.8,
              duration: 1200,
              easing: Easing.out(Easing.exp),
              useNativeDriver: true,
            }),
            Animated.timing(ringOpacity, {
              toValue: 0,
              duration: 1200,
              useNativeDriver: true,
            }),
          ]),
        ]),

        // Logo and text animations
        Animated.sequence([
          Animated.parallel([
            Animated.spring(logoScale, {
              toValue: 1,
              friction: 6,
              tension: 40,
              useNativeDriver: true,
            }),
            Animated.timing(logoOpacity, {
              toValue: 1,
              duration: 800,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(textOpacity, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(mottoOpacity, {
              toValue: 1,
              duration: 800,
              delay: 200,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]).start();
    }
  }, [assetsLoaded, fontsLoaded]);

  // Show loading state while assets are being loaded
  if (!assetsLoaded || !fontsLoaded || isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Image
            source={require('../../assets/GROUP 88-MasChat.png')}
            style={[styles.loadingLogo, { shadowColor: colors.dark }]}
            resizeMode="contain"
          />
          <Text style={[styles.loadingText, { color: colors.primary }]}>
            {!assetsLoaded ? 'Loading assets...' : !fontsLoaded ? 'Loading fonts...' : 'Loading...'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Animated connection ring */}
      <Animated.View
        style={[
          styles.ring,
          {
            transform: [{ scale: ringScale }],
            opacity: ringOpacity,
            borderColor: colors.accent,
          },
        ]}
      />

      {/* Logo */}
      <Animated.View
        style={{
          transform: [{ scale: logoScale }],
          opacity: logoOpacity,
        }}
      >
        <Image
          source={require('../../assets/GROUP 88-MasChat.png')}
          style={[styles.logo, { shadowColor: colors.dark }]}
          resizeMode="contain"
        />
      </Animated.View>

      {/* App title */}
      <Animated.Text style={[
        styles.title, 
        { 
          opacity: textOpacity,
          color: colors.primary,
          textShadowColor: colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(10, 36, 99, 0.25)',
        }
      ]}>
        Mas<Text style={[styles.accent, { color: colors.accent }]}>Chat</Text>
      </Animated.Text>

      {/* Motto */}
      <Animated.Text style={[
        styles.motto, 
        { 
          opacity: mottoOpacity,
          color: colors.secondary,
        }
      ]}>
      Limitless Connections, Limitless Possibilities
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    borderWidth: 3,
  },
  logo: {
    width: width * 0.5,
    height: width * 0.5,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  loadingLogo: {
    width: width * 0.3,
    height: width * 0.3,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 44,
    fontWeight: '800',
    letterSpacing: 1.6,
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 8,
    marginBottom: 8,
    fontFamily: 'Helvetica Neue',
  },
  accent: {
    // Will be set dynamically
  },
  motto: {
    fontSize: 16,
    letterSpacing: 0.8,
    fontWeight: '500',
    textTransform: 'uppercase',
    marginTop: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
