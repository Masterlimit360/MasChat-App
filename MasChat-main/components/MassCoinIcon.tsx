import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface MassCoinIconProps {
  size?: number;
  style?: any;
}

export default function MassCoinIcon({ size = 24, style }: MassCoinIconProps) {
  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <LinearGradient
        colors={['#FFD700', '#FFA500', '#FFD700']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.coin, { width: size, height: size, borderRadius: size / 2 }]}
      >
        <View style={styles.innerCircle}>
          <View style={styles.mSymbol}>
            <View style={styles.mLine1} />
            <View style={styles.mLine2} />
            <View style={styles.mLine3} />
          </View>
        </View>
        <View style={styles.circuitLines}>
          <View style={styles.circuitLine1} />
          <View style={styles.circuitLine2} />
          <View style={styles.circuitLine3} />
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  coin: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  innerCircle: {
    width: '60%',
    height: '60%',
    borderRadius: 50,
    backgroundColor: 'rgba(255, 215, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mSymbol: {
    width: '70%',
    height: '70%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mLine1: {
    position: 'absolute',
    width: 2,
    height: '60%',
    backgroundColor: '#FFD700',
    left: '20%',
    top: '20%',
  },
  mLine2: {
    position: 'absolute',
    width: 2,
    height: '60%',
    backgroundColor: '#FFD700',
    left: '50%',
    top: '20%',
    transform: [{ rotate: '45deg' }],
  },
  mLine3: {
    position: 'absolute',
    width: 2,
    height: '60%',
    backgroundColor: '#FFD700',
    right: '20%',
    top: '20%',
  },
  circuitLines: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  circuitLine1: {
    position: 'absolute',
    width: '80%',
    height: 1,
    backgroundColor: 'rgba(255, 215, 0, 0.6)',
    top: '15%',
    left: '10%',
  },
  circuitLine2: {
    position: 'absolute',
    width: '60%',
    height: 1,
    backgroundColor: 'rgba(255, 215, 0, 0.6)',
    bottom: '15%',
    left: '20%',
  },
  circuitLine3: {
    position: 'absolute',
    width: 1,
    height: '60%',
    backgroundColor: 'rgba(255, 215, 0, 0.6)',
    right: '20%',
    top: '20%',
  },
}); 