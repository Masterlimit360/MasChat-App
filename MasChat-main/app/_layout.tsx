import { Slot, Stack } from "expo-router";
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import AIChatModal from '../components/AIChatModal';
import ErrorBoundary from '../components/ErrorBoundary';
import FloatingAIButton from '../components/FloatingAIButton';
import NotificationBanner from './components/NotificationBanner';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from "./context/ThemeContext";
import { NotificationProvider } from './context/NotificationContext';

export default function RootLayout() {
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    return () => {
      setShowChat(false); // Cleanup on unmount
    };
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <NotificationProvider>
            <NotificationBanner />
            <FloatingAIButton onPress={() => setShowChat(true)} />
            <AuthProvider>
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: 'slide_from_right',
                  gestureEnabled: true,
                  gestureDirection: 'horizontal',
                }}
              >
                <Slot />
              </Stack>
              <AIChatModal visible={showChat} onClose={() => setShowChat(false)} />
            </AuthProvider>
          </NotificationProvider>
        </GestureHandlerRootView>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
