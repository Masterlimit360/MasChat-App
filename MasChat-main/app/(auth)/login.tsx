import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View, useColorScheme } from "react-native";
import * as Animatable from 'react-native-animatable';
import Toast from 'react-native-toast-message';
import { useAuth } from '../context/AuthContext';
import client, { BASE_URL, testConnection } from '../api/client';

// Color Palette (matching home screen)
const COLORS = {
  light: {
    primary: '#3A8EFF',  // New Blue
    accent: '#FF7F11',   // Vibrant Orange
    background: '#F5F7FA',
    white: '#FFFFFF',
    text: '#333333',
    lightText: '#888888',
    card: '#FFFFFF',
    border: '#E0E0E0',
    error: '#FF4444',
  },
  dark: {
    primary: '#3A8EFF',  // New Blue
    accent: '#FF7F11',   // Vibrant Orange
    background: '#1A1A2E',
    white: '#FFFFFF',
    text: '#FFFFFF',
    lightText: '#B0B0B0',
    card: '#2D2D44',
    border: '#404040',
    error: '#FF6B6B',
  },
};

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = COLORS[colorScheme === 'dark' ? 'dark' : 'light'];

  const { signIn } = useAuth();

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      username: '',
      password: '',
    };

    if (!username.trim()) {
      newErrors.username = 'Username is required';
      valid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    const isConnected = await testConnection();
    if (!isConnected) {
      Toast.show({
        type: 'error',
        text1: 'Connection Failed',
        text2: 'Cannot reach server. Check your network and server IP.',
        position: 'top',
        visibilityTime: 4000,
        topOffset: 60,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await client.post(
        `/auth/login`,
        { username: username.trim(), password },
        { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
      );

      if (response.data?.token) {
        const { token, user, userId, username: responseUsername } = response.data;
        
        // Create user object with proper structure
        const userObj = {
          id: userId || user?.id,
          username: responseUsername || user?.username,
          email: user?.email,
          fullName: user?.fullName,
          profilePicture: user?.profilePicture,
          coverPhoto: user?.coverPhoto,
          bio: user?.bio,
          createdAt: user?.createdAt,
          updatedAt: user?.updatedAt,
          verified: user?.verified,
          ...user // Include any additional fields
        };
        
        await signIn(token, userObj);
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('user', JSON.stringify(userObj));
        await AsyncStorage.setItem('username', userObj.username);
        
        Toast.show({
          type: 'success',
          text1: 'Login Successful',
          text2: 'Welcome back to MasChat!',
          position: 'top',
          visibilityTime: 3000,
          topOffset: 60,
        });
        router.replace('/(tabs)/home');
      }
    } catch (error: any) {
      let errorMessage = 'Login failed. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      Toast.show({
        type: 'error',
        text1: 'Login Error',
        text2: errorMessage,
        position: 'top',
        visibilityTime: 5000,
        topOffset: 60,
      });
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      await client.get(`/auth/test`, { timeout: 3000 });
      return true;
    } catch (error) {
      return false;
    }
  };

  useEffect(() => { testConnection(); }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      {/* Header matching home screen */}
      <LinearGradient
        colors={[colors.primary, '#2B6CD9']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.logo}>
          Mas<Text style={{ color: colors.accent }}>Chat</Text>
        </Text>
      </LinearGradient>

      <Animatable.View animation="fadeInUp" duration={1000} style={styles.content}>
        <View style={[styles.formContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.title, { color: colors.primary }]}>Welcome Back!</Text>
          <Text style={[styles.subtitle, { color: colors.lightText }]}>Connect, chat, and share with MasChat</Text>

          {/* Username Input */}
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color={colors.lightText} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text, backgroundColor: colors.card, borderColor: colors.border }]}
              placeholder="Username"
              placeholderTextColor={colors.lightText}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>
          {errors.username && <Text style={[styles.errorText, { color: colors.error }]}>{errors.username}</Text>}

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.lightText} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text, backgroundColor: colors.card, borderColor: colors.border }]}
              placeholder="Password"
              placeholderTextColor={colors.lightText}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={22}
                color={colors.lightText}
              />
            </TouchableOpacity>
          </View>
          {errors.password && <Text style={[styles.errorText, { color: colors.error }]}>{errors.password}</Text>}

          <TouchableOpacity
            style={[styles.button, loading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={loading}
          >
            <LinearGradient
              colors={loading ? ['#ccc', '#ccc'] : [colors.primary, '#2B6CD9']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Logging in...' : 'Log In'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => router.push("/(auth)/forgotPassword")}>
            <Text style={[styles.forgot, { color: colors.primary }]}>Forgot Password?</Text>
          </TouchableOpacity>
          
          <View style={styles.dividerContainer}>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Text style={[styles.or, { color: colors.lightText }]}>OR</Text>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
          </View>
          
          <TouchableOpacity
            style={[styles.createButton, loading && styles.disabledButton]}
            onPress={() => router.push("/(auth)/signup")}
            disabled={loading}
          >
            <LinearGradient
              colors={loading ? ['#ccc', '#ccc'] : [colors.accent, '#FF9E40']}
              style={styles.createButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.createButtonText}>
                {loading ? 'Creating...' : 'Create New Account'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animatable.View>
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  formContainer: {
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    height: 50,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 16,
    marginBottom: 16,
    height: 50,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: "bold",
  },
  forgot: {
    textAlign: "center",
    marginBottom: 16,
    fontSize: 14,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  or: {
    marginHorizontal: 10,
    fontWeight: "bold",
    fontSize: 14,
  },
  createButton: {
    borderRadius: 12,
    overflow: 'hidden',
    height: 50,
  },
  createButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    fontSize: 13,
    marginBottom: 12,
    marginLeft: 12,
  },
});