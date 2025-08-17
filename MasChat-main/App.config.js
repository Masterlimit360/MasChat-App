export default ({ config }) => ({
  ...config,
  name: 'MasChat',
  slug: 'maschat',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'MasChat',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  loading: {
    icon: './assets/GROUP 88-MasChat.png',
    backgroundColor: '#1A1A2E',
  },
  splash: {
    image: './assets/GROUP 88-MasChat.png',
    resizeMode: 'contain',
    backgroundColor: '#4361EE'
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.maschat.app',
    splash: {
      image: './assets/GROUP 88-MasChat.png',
      resizeMode: 'contain',
      backgroundColor: '#4361EE'
    }
  },
  android: {
    package: 'com.maschat.app',
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#4361EE'
    },
    splash: {
      image: './assets/GROUP 88-MasChat.png',
      resizeMode: 'contain',
      backgroundColor: '#4361EE'
    },
    edgeToEdgeEnabled: true
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png'
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/GROUP 88-MasChat.png',
        resizeMode: 'contain',
        backgroundColor: '#4361EE'
      }
    ],
    [
      'expo-camera',
      {
        cameraPermission: 'Allow $(PRODUCT_NAME) to access your camera',
        microphonePermission: 'Allow $(PRODUCT_NAME) to access your microphone',
        recordAudioAndroid: true
      }
    ]
  ],
  experiments: {
    typedRoutes: true
  },
  extra: {
    eas: {
      projectId: '11448f8f-45d1-4c2c-a061-f9227f473390'
    },
    // Use environment variable or fallback to localhost for development
    API_URL: process.env.API_URL || 'http://10.132.74.85:8080/api',
    ENV: process.env.NODE_ENV || 'development',
    router: {}
  },
  owner: 'masterlimit360'
});