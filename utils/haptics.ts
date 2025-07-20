import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const isIPad = Platform.OS === 'ios' && Platform.isPad;

export enum HapticType {
  LIGHT = 'light',
  MEDIUM = 'medium',
}

export const triggerHaptic = async (type: HapticType): Promise<void> => {
  if (isIPad) return;

  try {
    switch (type) {
      case HapticType.LIGHT:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case HapticType.MEDIUM:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
    }
  } catch (error) {
  }
};

export const withHaptics = <T extends (...args: any[]) => any>(
  onPress: T,
  type: HapticType = HapticType.MEDIUM
): T => {
  return (async (...args: Parameters<T>) => {
    await triggerHaptic(type);
    return onPress(...args);
  }) as T;
};

let lastHapticTime = 0;
const HAPTIC_DEBOUNCE_MS = 100;

export const triggerDebouncedHaptic = async (type: HapticType = HapticType.MEDIUM): Promise<void> => {
  const now = Date.now();
  if (now - lastHapticTime >= HAPTIC_DEBOUNCE_MS) {
    lastHapticTime = now;
    await triggerHaptic(type);
  }
};

export const HapticFeedback = {
  screenTransition: () => triggerHaptic(HapticType.MEDIUM),
  buttonPress: () => triggerHaptic(HapticType.MEDIUM),
  selection: () => triggerHaptic(HapticType.MEDIUM),
  submission: () => triggerHaptic(HapticType.MEDIUM),
  messageSent: () => triggerHaptic(HapticType.MEDIUM),
  messageTyping: () => triggerDebouncedHaptic(HapticType.MEDIUM),
  purchase: () => triggerHaptic(HapticType.MEDIUM),
  restore: () => triggerHaptic(HapticType.MEDIUM),
  error: () => triggerHaptic(HapticType.MEDIUM),
  success: () => triggerHaptic(HapticType.MEDIUM),
  progress: () => triggerHaptic(HapticType.MEDIUM),
  complete: () => triggerHaptic(HapticType.MEDIUM),
};