import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { BackHandler, View as RNView, ActivityIndicator, AppState } from 'react-native';
import { revenueCatService } from '@/services/revenueCatService';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Header } from '@/components/Header';
import { SafeAreaView } from 'react-native-safe-area-context';

export const unstable_settings = {
  initialRouteName: 'home',
};

function ProtectedRoutes() {
  const router = useRouter();
  const [subscriptionState, setSubscriptionState] = useState<'checking' | 'valid' | 'invalid'>('checking');

  useEffect(() => {
    let isCancelled = false;

    const verifyAccess = async () => {
      try {
        // Force fresh check by invalidating cache first
        await revenueCatService.invalidateCache();
        const ok = await revenueCatService.isSubscribed();
        
        if (!isCancelled) {
          if (ok) {
            setSubscriptionState('valid');
          } else {
            setSubscriptionState('invalid');
            router.replace('/(public)/6-paywall');
          }
        }
      } catch (e) {
        console.warn('Subscription check failed:', e);
        if (!isCancelled) {
          // Fail closed - treat errors as invalid subscription
          setSubscriptionState('invalid');
          router.replace('/(public)/6-paywall');
        }
      }
    };

    // Initial check
    void verifyAccess();

    // Re-validate when app returns to foreground
    const appStateSub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void verifyAccess();
      }
    });

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => {
      isCancelled = true;
      backHandler.remove();
      appStateSub.remove();
    };
  }, [router]);

  // Block ALL rendering until validation completes
  if (subscriptionState !== 'valid') {
    return (
      <RNView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fdfdfd' }}>
        <ActivityIndicator size="large" color="#a26235" />
      </RNView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fdfdfd' }}>
      <Header />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none', // ✅ no transitions
        }}
      >
        <Stack.Screen
          name="camera"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom', // ✅ explicit override
          }}
        />
      </Stack>
    </SafeAreaView>
  );
}

export default function ProtectedLayout() {
  return (
    <ErrorBoundary>
      <ProtectedRoutes />
    </ErrorBoundary>
  );
}
