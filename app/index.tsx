import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { revenueCatService, ENTITLEMENT_ID } from '@/services/revenueCatService';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        setIsSubscribed(false);
        setIsLoading(false);
      }
    }, 10000); // 10 second timeout

    async function checkSubscription() {
      try {
        const customerInfo = await revenueCatService.getCustomerInfo();
        if (isMounted) {
          const hasActiveSubscription = customerInfo.entitlements.active[ENTITLEMENT_ID]?.isActive === true;
          setIsSubscribed(hasActiveSubscription);
        }
      } catch (error) {
        if (isMounted) {
          console.warn('Subscription check failed, defaulting to free:', error);
          setIsSubscribed(false);
        }
      } finally {
        if (isMounted) {
          clearTimeout(timeoutId);
          setIsLoading(false);
        }
      }
    }

    void checkSubscription();
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fdfdfd' }}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  if (isSubscribed) {
    return <Redirect href="/(protected)/home" />;
  }

  return <Redirect href="/1-start" />;
} 
