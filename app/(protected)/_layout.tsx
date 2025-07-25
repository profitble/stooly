import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { BackHandler, View as RNView, ActivityIndicator } from 'react-native';
import { revenueCatService } from '@/services/revenueCatService';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Header } from '@/components/Header';
import { SafeAreaView } from 'react-native-safe-area-context';

export const unstable_settings = {
  initialRouteName: 'home',
};

function ProtectedRoutes() {
  const router = useRouter();
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function verifyAccess() {
      try {
        const ok = await revenueCatService.isSubscribed();
        if (isMounted) {
          if (!ok) {
            router.replace('/(public)/6-paywall');
          } else {
            setIsSubscribed(true);
          }
        }
      } catch (e) {
        console.warn('Subscription check failed:', e);
        if (isMounted) {
          router.replace('/(public)/6-paywall');
        }
      }
    }

    void verifyAccess();

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => {
      isMounted = false;
      backHandler.remove();
    };
  }, [router]);

  if (isSubscribed === null) {
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
