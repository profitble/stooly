import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View as RNView, AppState, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { revenueCatService } from '@/services/revenueCatService';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Header } from '@/components/Header';

export const unstable_settings = {
  initialRouteName: 'home',
};

function ProtectedLayoutInner() {
  const router = useRouter();
  const [subscriptionState, setSubscriptionState] = useState<'checking' | 'valid' | 'invalid'>('checking');

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        await revenueCatService.invalidateCache();
        const isSubscribed = await revenueCatService.isSubscribed();
        if (!cancelled) {
          if (isSubscribed) setSubscriptionState('valid');
          else {
            setSubscriptionState('invalid');
            router.replace('/(public)/1-start');
          }
        }
      } catch {
        if (!cancelled) {
          setSubscriptionState('invalid');
          router.replace('/(public)/1-start');
        }
      }
    };

    void check(); // ✅ mark as intentionally unawaited

    const appListener = AppState.addEventListener('change', (s) => {
      if (s === 'active') void check(); // ✅ also void here
    });

    const back = BackHandler.addEventListener('hardwareBackPress', () => true);

    return () => {
      cancelled = true;
      appListener.remove();
      back.remove();
    };
  }, [router]); // ✅ include router dependency

  // While checking or invalid we render nothing – splash screen has already handled UX.
  if (subscriptionState !== 'valid') return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fdfdfd' }}>
      <Header />
      <Stack screenOptions={{ headerShown: false, animation: 'none' }}>
        <Stack.Screen
          name="camera"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
      </Stack>
    </SafeAreaView>
  );
}

export default function ProtectedLayout() {
  return (
    <ErrorBoundary>
      <ProtectedLayoutInner />
    </ErrorBoundary>
  );
}
