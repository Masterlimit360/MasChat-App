import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';

// Function to get the device's IP address
const getDeviceIP = (): string => {
  // Auto-detected IP address
  return '10.225.193.125'; // Current IP address
};

// Centralized configuration
export const API_CONFIG = {
  BASE_URL: `http://${getDeviceIP()}:8080/api`,
  WS_URL: `http://${getDeviceIP()}:8080/ws-chat`,
  UPLOAD_URL: `http://${getDeviceIP()}:8080/uploads`,
  PORT: 8080,
  IP: getDeviceIP(),
};

// Export individual URLs for convenience
export const BASE_URL = API_CONFIG.BASE_URL;
export const WS_BASE_URL = API_CONFIG.WS_URL;
export const UPLOAD_BASE_URL = API_CONFIG.UPLOAD_URL;

const client = axios.create({
  baseURL: BASE_URL,
});

// Add request interceptor to automatically add Authorization header
client.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
client.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear storage
      try {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('user');
      } catch (storageError) {
        console.error('Error clearing storage:', storageError);
      }
    }
    return Promise.reject(error);
  }
);

// Utility function to test backend connection
export const testConnection = async () => {
  try {
    const response = await client.get('/auth/test', {
      timeout: 5000
    });
    return response.data === "Backend connection successful";
  } catch (error) {
    console.error("Backend connection test failed:", error);
    return false;
  }
};

// Utility function to get full URL for uploads
export const getUploadUrl = (fileName: string): string => {
  return `${UPLOAD_BASE_URL}/${fileName}`;
};

// Utility function to get WebSocket URL
export const getWebSocketUrl = (): string => {
  return WS_BASE_URL;
};

export default client;
