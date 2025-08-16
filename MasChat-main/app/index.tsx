import React from 'react';
import Toast from 'react-native-toast-message';
import SplashScreen from './screens/SplashScreen';

export default function Index() {
  return (
    <>
      <SplashScreen />
      <Toast />
    </>
  );
}