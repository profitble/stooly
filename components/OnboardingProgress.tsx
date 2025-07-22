import React, { useEffect, useRef } from 'react';
import { Animated, View as RNView } from 'react-native';

const View = RNView as any;
const RING_INACTIVE = '#E5E7EB';
const PRIMARY = '#111';

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
    <View className="h-[5px] flex-1 rounded-full overflow-hidden" style={{ backgroundColor: RING_INACTIVE }}>
      <Animated.View
        style={{
          width: widthInterpolate,
          height: '100%',
          backgroundColor: PRIMARY,
          borderRadius: 9999,
        }}
      />
    </View>
  );
}