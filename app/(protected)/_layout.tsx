import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { BackHandler } from 'react-native';
import { revenueCatService, ENTITLEMENT_ID } from '@/services/revenueCatService';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Header } from '@/components/Header';
import { View as RNView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Purchases from 'react-native-purchases';

export const unstable_settings = {
  initialRouteName: 'home',
};

type RouteParams = {
  animation?: 'fade' | 'slide_from_right' | 'none';
  duration?: string;
};

function ProtectedRoutes() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    async function checkSubscription() {
      try {
        const hasActiveSubscription = await revenueCatService.isSubscribed();
        
        if (isMounted) {
          setIsSubscribed(hasActiveSubscription);
          if (!hasActiveSubscription) {
            router.replace('/(public)/6-paywall');
            return;
          }
        }
      } catch (error) {
        console.warn('Subscription check failed:', error);
        if (isMounted) {
          setIsSubscribed(false);
          router.replace('/(public)/6-paywall');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void checkSubscription();

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      return true; // Prevent going back to public routes
    });

    return () => {
      isMounted = false;
      backHandler.remove();
    };
  }, [router]);

  if (isLoading || isSubscribed === false) {
    return (
      <RNView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fdfdfd' }}>
        <ActivityIndicator size="large" color="#a26235" />
      </RNView>
    );
  }

  if (!isSubscribed) {
    return null;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fdfdfd' }}>
      <Header />
      <Stack 
        screenOptions={{
          headerShown: false,
          animation: 'none',
        }}
      >
        <Stack.Screen 
          name="camera" 
          options={{ 
            presentation: 'modal',
            animation: 'slide_from_bottom',
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