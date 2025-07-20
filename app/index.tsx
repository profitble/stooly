import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { revenueCatService, ENTITLEMENT_ID } from '@/services/revenueCatService';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkSubscription() {
      try {
        const customerInfo = await revenueCatService.getCustomerInfo();
        const hasActiveSubscription = customerInfo.entitlements.active[ENTITLEMENT_ID]?.isActive === true;
        setIsSubscribed(hasActiveSubscription);
      } catch (error) {
        setIsSubscribed(false);
      } finally {
        setIsLoading(false);
      }
    }

    void checkSubscription();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#180b0b' }}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  if (isSubscribed) {
    return <Redirect href="/(protected)/home" />;
  }

  return <Redirect href="/1-start" />;
} 
