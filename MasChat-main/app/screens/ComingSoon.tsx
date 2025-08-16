import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { useRouter } from 'expo-router';

export default function ComingSoon() {
  const router = useRouter();
  return (
    <LinearGradient colors={['#f5f7fa', '#e4e8f0']} style={[styles.container, { paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 0) }] }>
      <StatusBar backgroundColor="#f5f7fa" barStyle="dark-content" translucent />
      <View style={styles.content}>
        <Text style={styles.title}>🚀 Coming Soon 🚀</Text>
        <Text style={styles.subtitle}>This feature is coming soon. Stay tuned for updates!</Text>
        <TouchableOpacity onPress={() => {
          if (router.canGoBack?.()) {
            router.back();
          } else {
            router.replace('/(tabs)/home');
          }
        }} style={{marginTop: 24, alignSelf: 'center', padding: 12, backgroundColor: '#1877f2', borderRadius: 8}}>
          <Text style={{color: '#fff', fontWeight: 'bold'}}>Back</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { alignItems: 'center', padding: 32, backgroundColor: '#fff', borderRadius: 16, elevation: 2 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1877f2', marginBottom: 12 },
  subtitle: { fontSize: 16, color: '#444', textAlign: 'center' },
}); 