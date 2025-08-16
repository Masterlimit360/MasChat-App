import React, { createContext, useContext, useState, useEffect } from "react";
import { Appearance, useColorScheme } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  themeMode: ThemeMode;
  currentTheme: 'light' | 'dark';
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'system',
  currentTheme: 'light',
  setThemeMode: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');

  // Load saved theme preference on app start
  useEffect(() => {
    loadThemePreference();
  }, []);

  // Update current theme when themeMode or system color scheme changes
  useEffect(() => {
    if (themeMode === 'system') {
      setCurrentTheme(systemColorScheme || 'light');
    } else {
      setCurrentTheme(themeMode);
    }
  }, [themeMode, systemColorScheme]);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('themeMode');
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setThemeModeState(savedTheme as ThemeMode);
      }
    } catch (error) {
      console.log('Error loading theme preference:', error);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      setThemeModeState(mode);
      await AsyncStorage.setItem('themeMode', mode);
    } catch (error) {
      console.log('Error saving theme preference:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ themeMode, currentTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);