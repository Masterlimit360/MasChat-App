import { Ionicons } from '@expo/vector-icons';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LiveScreen() {
  const router = useRouter();
  const [facing, setFacing] = useState<CameraType>('back');
  const [isLive, setIsLive] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions not granted yet
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={() => router.push('/screens/ComingSoon')}
        >
          <Text style={styles.permissionButtonText}>Go Live (Coming Soon)</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={{ marginTop: 20 }}
        >
          <Ionicons name="arrow-back" size={28} color="#222" />
        </TouchableOpacity>
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => {
            if (router.canGoBack?.()) {
              router.back();
            } else {
              router.replace('/(tabs)/home');
            }
          }}>
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
          
          {isLive && (
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
          
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.bottomControls}>
          <TouchableOpacity 
            style={styles.flipButton}
            onPress={toggleCameraFacing}
          >
            <Ionicons name="camera-reverse" size={28} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.liveButton, isLive && styles.liveButtonActive]}
            onPress={() => setIsLive(!isLive)}
          >
            <Text style={styles.liveButtonText}>
              {isLive ? 'End Live' : 'Go Live'}
            </Text>
          </TouchableOpacity>
          
          <View style={{ width: 28 }} />
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#1877f2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  permissionButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  camera: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
    marginRight: 6,
  },
  liveText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 30,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  flipButton: {
    padding: 10,
  },
  liveButton: {
    backgroundColor: 'red',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 20,
  },
  liveButtonActive: {
    backgroundColor: '#333',
  },
  liveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});