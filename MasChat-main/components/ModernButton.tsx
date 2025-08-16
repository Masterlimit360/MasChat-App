import React from 'react';
import { Pressable, Text, StyleSheet, View, ActivityIndicator } from 'react-native';
import { Colors } from '../constants/Colors';
import { useColorScheme } from '../hooks/useColorScheme';

export type ModernButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  style?: any;
  textStyle?: any;
};

const ModernButton: React.FC<ModernButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const theme = useColorScheme() || 'light';
  const palette = Colors[theme];

  let backgroundColor = palette.primary;
  let borderColor = palette.primary;
  let textColor = palette.surface;
  let shadow = styles.shadow;
  let hasShadow = true;

  if (variant === 'secondary') {
    backgroundColor = palette.secondary;
    borderColor = palette.secondary;
  } else if (variant === 'accent') {
    backgroundColor = palette.accent;
    borderColor = palette.accent;
  } else if (variant === 'outline') {
    backgroundColor = 'transparent';
    borderColor = palette.primary;
    textColor = palette.primary;
    hasShadow = false;
  } else if (variant === 'ghost') {
    backgroundColor = 'transparent';
    borderColor = 'transparent';
    textColor = palette.text;
    hasShadow = false;
  }

  if (disabled) {
    backgroundColor = palette.border;
    borderColor = palette.border;
    textColor = palette.icon;
    hasShadow = false;
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => {
        const styleArr: any[] = [
          styles.button,
          { backgroundColor, borderColor, shadowColor: palette.primary },
        ];
        if (hasShadow) styleArr.push(styles.shadow);
        if (pressed && !disabled) styleArr.push(styles.pressed);
        if (disabled) styleArr.push(styles.disabled);
        if (style) styleArr.push(style);
        return styleArr;
      }}
      android_ripple={{ color: palette.primary + '22' }}
    >
      {loading ? (
        <ActivityIndicator color={textColor} style={{ marginRight: 8 }} />
      ) : icon ? (
        <View style={{ marginRight: 8 }}>{icon}</View>
      ) : null}
      <Text style={[styles.text, { color: textColor }, textStyle]}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 28,
    borderWidth: 1.5,
    marginVertical: 8,
    minHeight: 48,
    minWidth: 120,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.6,
  },
});

export default ModernButton; 