import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

type ModernHeaderProps = {
  title: string | React.ReactNode;
  showBackButton?: boolean;
  onBackPress?: () => void;
  gradient?: string[];
  right?: React.ReactNode;
};

export default function ModernHeader({
  title,
  showBackButton,
  onBackPress,
  gradient,
  right,
}: ModernHeaderProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  return (
    <LinearGradient
      colors={gradient || theme.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.header}
    >
      <View style={styles.left}>
        {showBackButton && (
          <TouchableOpacity onPress={onBackPress} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.center}>
        {typeof title === 'string' ? (
          <Text style={styles.title}>{title}</Text>
        ) : (
          title
        )}
      </View>
      <View style={styles.right}>{right}</View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
  },
  left: { flex: 1 },
  center: { flex: 2, alignItems: 'center', justifyContent: 'center' },
  title: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 24,
    letterSpacing: 1,
    textAlign: 'center',
  },
  right: { flex: 1, alignItems: 'flex-end' },
  backBtn: { padding: 4 },
});