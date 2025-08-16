const AsyncStorage = require('@react-native-async-storage/async-storage');

async function clearStoredAuth() {
  try {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('user');
    console.log('Stored authentication data cleared successfully');
  } catch (error) {
    console.log('Error clearing auth data:', error);
  }
}

clearStoredAuth(); 