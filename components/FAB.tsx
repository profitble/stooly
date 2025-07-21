import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus } from 'phosphor-react-native';
import { Pressable } from '@gluestack-ui/themed';
import { config } from '@/styles/gluestack-ui.config';

const themeColors = (config as any).tokens.colors;

export const FAB = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handlePress = () => {
    router.push('/(protected)/camera');
  };

  return (
    <Pressable
      style={[styles.fab, { bottom: (insets.bottom || 16) + 26 }]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel="Open camera"
    >
      <Plus size={32} weight="bold" color={themeColors.fabIcon} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 26,
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: themeColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
    }),
  },
}); 