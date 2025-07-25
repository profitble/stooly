import { useEffect, useState } from 'react';
import { View, ActivityIndicator, AppState } from 'react-native';
import { Redirect } from 'expo-router';
import { revenueCatService, ENTITLEMENT_ID } from '@/services/revenueCatService';
import Purchases from 'react-native-purchases';

export default function Index() {
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function checkSubscription() {
      try {
        const hasActiveSubscription = await revenueCatService.isSubscribed();
        if (isMounted) {
          setIsSubscribed(hasActiveSubscription);
        }
      } catch (error) {
        if (isMounted) {
          console.warn('Subscription check failed, defaulting to free:', error);
          setIsSubscribed(false);
        }
      }
    }

    void checkSubscription();

    // Foreground listener - refresh subscription when app comes back from background
    const appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void checkSubscription();
      }
    });

    // RevenueCat listener - automatically update when subscription changes
    Purchases.addCustomerInfoUpdateListener((info) => {
      if (isMounted) {
        setIsSubscribed(info.entitlements.active[ENTITLEMENT_ID]?.isActive ?? false);
      }
    });

    return () => {
      isMounted = false;
      appStateSubscription?.remove();
      // No need to remove RevenueCat listener — not supported
    };
  }, []);

  if (isSubscribed === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fdfdfd' }}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  return <Redirect href={isSubscribed ? '/(protected)/home' : '/1-start'} />;
}