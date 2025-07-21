import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { Box } from '@gluestack-ui/themed';
import { config } from '@/styles/gluestack-ui.config';

const themeColors = (config as any).tokens.colors;

export default function OnboardingProgress({ step }: { step: number }) {
  const totalSteps = 7;
  const progress = Math.max(0, Math.min(1, step / totalSteps));
  
  const animatedWidth = useRef(new Animated.Value(progress)).current;
  const previousStep = useRef(step);

  useEffect(() => {
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
    <Box
      style={{
        height: 5,
        borderRadius: 9999,
        backgroundColor: themeColors.ringInactive,
        overflow: 'hidden',
        flex: 1,
      }}
    >
      <Animated.View
        style={{
          width: widthInterpolate,
          height: '100%',
          backgroundColor: themeColors.primaryText,
          borderRadius: 9999,
        }}
      />
    </Box>
  );
}