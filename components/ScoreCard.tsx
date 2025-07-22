import React, { useState } from 'react';
import { type LayoutChangeEvent, View as RNView, Text as RNText } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const View = RNView as any;
const Text = RNText as any;

interface GutHealthScoreCardProps {
  score: number | null;
}

const GRADIENT_COLORS = ['#3b82f6', '#22c55e', '#facc15', '#ef4444'];
const COLOR_BLUE = '#3b82f6';
const COLOR_ORANGE = '#facc15';
const COLOR_RED = '#ef4444';
const COLOR_SECONDARY = '#6b7280';
const CARD_BG = '#fdfdfd';
const EMPTY_BG = '#f3f4f6';

const getStatus = (score: number) => {
  if (score < 25) return { text: 'Needs Attention', color: COLOR_BLUE };
  if (score < 50) return { text: 'Getting There', color: '#22c55e' };
  if (score < 75) return { text: 'On Track', color: COLOR_ORANGE };
  return { text: 'Optimal', color: COLOR_RED };
};

export const GutHealthScoreCard = ({ score }: GutHealthScoreCardProps) => {
  const [containerWidth, setContainerWidth] = useState(0);

  if (score === null) {
    return (
      <View className="rounded-[18px] px-5 py-8 mt-4 mb-4 items-center justify-center" style={{ backgroundColor: EMPTY_BG }}>
        <Text className="text-base text-gray-500 text-center">Waiting for your first analysis of the week.</Text>
      </View>
    );
  }

  const progress = score / 100;
  const status = getStatus(score);
  
  const handleLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };
  
  const indicatorPosition = containerWidth * progress;

  return (
    <View className="rounded-[18px] px-5 pt-5 pb-6 mt-4 mb-4" style={{ backgroundColor: CARD_BG }}>
      <View className="flex-row justify-between items-center">
        <Text className="text-base text-gray-500 font-medium">
          Your gut health is{' '}
          <Text className="text-white rounded-md px-2 py-0.5 font-bold" style={{ backgroundColor: status.color }}>{status.text}</Text>
        </Text>
      </View>
      <Text className="text-4xl font-bold text-[#111] mt-1">{score.toFixed(1)}</Text>

      <View className="h-[12px] w-full justify-center mt-4" onLayout={handleLayout}>
        <LinearGradient
          colors={GRADIENT_COLORS as [string, string, string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ height: '100%', borderRadius: 6 }}
        />
        {containerWidth > 0 && (
          <View
            style={{
              position: 'absolute',
              left: indicatorPosition,
              width: 4,
              height: 24,
              backgroundColor: 'black',
              borderRadius: 2,
              borderWidth: 1,
              borderColor: 'white',
              transform: [{ translateX: -2 }],
            }}
          />
        )}
      </View>
    </View>
  );
}; 