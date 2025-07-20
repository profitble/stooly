import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { BackHandler, View } from 'react-native';
import { revenueCatService, ENTITLEMENT_ID } from '@/services/revenueCatService';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Header } from '@/components/Header';
import { SafeAreaView } from 'react-native-safe-area-context';
import { themeColors } from '@/styles/theme';

export const unstable_settings = {
  initialRouteName: 'home',
};

type RouteParams = {
  animation?: 'fade' | 'slide_from_right' | 'none';
  duration?: string;
};

function ProtectedRoutes() {
  const router = useRouter();
  let isMounted = true;

  useEffect(() => {
    async function checkSubscription() {
      try {
        const customerInfo = await revenueCatService.getCustomerInfo();
        if (!customerInfo.entitlements.active[ENTITLEMENT_ID] && isMounted) {
          router.replace('/(public)/6-paywall');
        }
      } catch (error) {
        if (isMounted) {
          throw error; // This will be caught by ErrorBoundary
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
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