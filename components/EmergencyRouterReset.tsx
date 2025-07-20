import { useFocusEffect } from 'expo-router';

export function EmergencyRouterReset() {
  useFocusEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      require('expo-router/build/global-state').routerStore.reset();
    }
  });
  return null;
} 