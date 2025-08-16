import { Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        animation: 'slide_from_right', // Default: slide in from right
      }}
    >
      <Stack.Screen name="login" options={{ animation: 'slide_from_left' }} />
      <Stack.Screen name="signup" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="forgotPassword" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="resetPassword" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
} 