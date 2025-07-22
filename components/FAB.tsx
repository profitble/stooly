import React from 'react';
import { StyleSheet, Platform, Pressable as RNPressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus } from 'phosphor-react-native';

const Pressable = RNPressable as any;
const FAB_BG = '#a26235';
const FAB_ICON = '#fff';

export const FAB = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handlePress = () => {
    router.push('/(protected)/camera');
  };

  return (
    <Pressable
      className="absolute right-[26px] w-[62px] h-[62px] rounded-full items-center justify-center"
      style={{
        backgroundColor: FAB_BG,
        bottom: (insets.bottom || 16) + 26,
        ...Platform.select({
          ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
          },
          android: { elevation: 6 },
        }),
      }}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel="Open camera"
    >
      <Plus size={32} weight="bold" color={FAB_ICON} />
    </Pressable>
  );
}; 