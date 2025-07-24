import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { revenueCatService, ENTITLEMENT_ID } from '@/services/revenueCatService';
import Purchases from 'react-native-purchases';

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
        const hasActiveSubscription = await revenueCatService.isSubscribed();
        if (isMounted) {
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

  if (isSubscribed === true) {
    return <Redirect href="/(protected)/home" />;
  }

  return <Redirect href="/1-start" />;
} 
