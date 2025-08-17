import { Slot, Stack } from "expo-router";
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from "react-native-safe-area-context";
import AIChatModal from '../components/AIChatModal';
import ErrorBoundary from '../components/ErrorBoundary';
import FloatingAIButton from '../components/FloatingAIButton';
import NotificationBanner from './components/NotificationBanner';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from "./context/ThemeContext";
import { NotificationProvider } from './context/NotificationContext';
import { Web3Provider } from './context/Web3Context';

export default function RootLayout() {
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    return () => {
      setShowChat(false); // Cleanup on unmount
    };
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ThemeProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <NotificationProvider>
              <NotificationBanner />
              <FloatingAIButton onPress={() => setShowChat(true)} />
              <Web3Provider>
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
              </Web3Provider>
            </NotificationProvider>
          </GestureHandlerRootView>
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
