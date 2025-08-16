import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View, useColorScheme } from "react-native";
import * as Animatable from 'react-native-animatable';
import Toast from 'react-native-toast-message';
import client from '../api/client';

// Color Palette with dark mode support
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

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const { token } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = COLORS[colorScheme === 'dark' ? 'dark' : 'light'];

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      password: '',
      confirmPassword: '',
    };

    if (!password) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      valid = false;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      valid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await client.post(
        `/auth/reset-password`,
        { 
          token: token as string,
          password: password 
        },
        { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
      );

      Toast.show({
        type: 'success',
        text1: 'Password Reset Successful',
        text2: 'Your password has been reset successfully. You can now login with your new password.',
        position: 'top',
        visibilityTime: 4000,
        topOffset: 60,
      });

      // Navigate to login
      router.replace('/(auth)/login');
    } catch (error: any) {
      let errorMessage = 'Failed to reset password. Please try again.';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
        position: 'top',
        visibilityTime: 5000,
        topOffset: 60,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, '#2B6CD9']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.logo}>
          Mas<Text style={{ color: colors.accent }}>Chat</Text>
        </Text>
      </LinearGradient>

      <Animatable.View animation="fadeInUp" duration={1000} style={styles.content}>
        <View style={[styles.formContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.title, { color: colors.primary }]}>Reset Password</Text>
          <Text style={[styles.subtitle, { color: colors.lightText }]}>
            Enter your new password below.
          </Text>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.lightText} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text, backgroundColor: colors.card, borderColor: colors.border }]}
              placeholder="New Password"
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

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.lightText} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text, backgroundColor: colors.card, borderColor: colors.border }]}
              placeholder="Confirm New Password"
              placeholderTextColor={colors.lightText}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword((prev) => !prev)}>
              <Ionicons
                name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                size={22}
                color={colors.lightText}
              />
            </TouchableOpacity>
          </View>
          {errors.confirmPassword && <Text style={[styles.errorText, { color: colors.error }]}>{errors.confirmPassword}</Text>}

          <TouchableOpacity
            style={[styles.button, loading && styles.disabledButton]}
            onPress={handleResetPassword}
            disabled={loading}
          >
            <LinearGradient
              colors={loading ? ['#ccc', '#ccc'] : [colors.primary, '#2B6CD9']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
            <Text style={[styles.backToLogin, { color: colors.primary }]}>Back to Login</Text>
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
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 1,
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
  backToLogin: {
    textAlign: "center",
    marginTop: 16,
    fontSize: 14,
  },
  errorText: {
    fontSize: 13,
    marginBottom: 12,
    marginLeft: 12,
  },
}); 