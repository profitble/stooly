import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

export default function OnboardingProgress({ step }: { step: number }) {
  const totalSteps = 7;
  const progress = Math.max(0, Math.min(1, step / totalSteps));
  
  // Initialize with correct progress value instead of 0
  const animatedWidth = useRef(new Animated.Value(progress)).current;
  const previousStep = useRef(step);

  useEffect(() => {
    // Only animate if the step has actually changed
    if (previousStep.current !== step) {
      Animated.timing(animatedWidth, {
        toValue: progress,
        duration: 400,
        useNativeDriver: false,
      }).start();
      previousStep.current = step;
    }
  }, [progress, step]);

  const widthInterpolate = animatedWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View
      style={{
        height: 5,
        borderRadius: 9999,
        backgroundColor: '#F0F0F0',
        overflow: 'hidden',
        flex: 1,
      }}
    >
      <Animated.View
        style={{
          width: widthInterpolate,
          height: '100%',
          backgroundColor: '#111',
          borderRadius: 9999,
        }}
      />
    </View>
  );
}