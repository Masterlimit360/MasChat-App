import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

type FloatingAIButtonProps = {
  onPress: () => void;
};

export default function FloatingAIButton({ onPress }: FloatingAIButtonProps) {
  // Starting position (bottom right)
  const startingPosition = { x: width - 80, y: height - 180 };
  
  // Shared values for position
  const translateX = useSharedValue(startingPosition.x);
  const translateY = useSharedValue(startingPosition.y);
  
  // Track button states
  const isPressed = useSharedValue(false);
  const isHovered = useSharedValue(false);
  const isActive = useSharedValue(false);

  // Pan gesture handler
  const panGesture = Gesture.Pan()
    .onBegin(() => {
      isPressed.value = true;
    })
    .onUpdate((e) => {
      // Calculate new position with boundaries
      const newX = e.absoluteX - 28; // 28 = half of button width
      const newY = e.absoluteY - 28; // 28 = half of button height
      
      // Keep within screen bounds
      translateX.value = Math.max(0, Math.min(newX, width - 56));
      translateY.value = Math.max(0, Math.min(newY, height - 56));
    })
    .onFinalize(() => {
      isPressed.value = false;
      // Snap to edges if not near starting position
      if (translateY.value < height - 200) {
        const snapToSide = translateX.value < width / 2 ? 20 : width - 76;
        translateX.value = withSpring(snapToSide);
        translateY.value = withSpring(20);
      } else {
        translateX.value = withSpring(startingPosition.x);
        translateY.value = withSpring(startingPosition.y);
      }
    });

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: withSpring(isPressed.value ? 0.9 : isActive.value ? 1.1 : 1) },
    ],
    shadowOpacity: withTiming(isPressed.value ? 0.3 : isActive.value ? 0.4 : 0.2),
    backgroundColor: withTiming(isPressed.value ? '#0f5fd6' : isActive.value ? '#1a6ff2' : '#1877f2'),
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: withSpring(isPressed.value ? 0.9 : isActive.value ? 1.2 : 1) },
      { rotate: withSpring(isHovered.value ? '0deg' : '0deg') },
    ],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: isActive.value ? withSpring(1.3) : withSpring(1) }],
    opacity: isActive.value ? withTiming(0.5) : withTiming(0),
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View 
        style={[styles.buttonContainer, animatedStyle]}
        onTouchStart={() => {
          isHovered.value = true;
          isActive.value = true;
        }}
        onTouchEnd={() => {
          isHovered.value = false;
          isActive.value = false;
          onPress();
        }}
      >
        <Animated.View style={[styles.pulseEffect, pulseStyle]} />
        <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
          <Ionicons
            name="sparkles"
            size={24}
            color="#fff"
          />
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    position: 'absolute',
    zIndex: 1000,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1877f2',
    elevation: 6,
    shadowColor: '#1877f2',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  pulseEffect: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1877f2',
  },
  iconContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});