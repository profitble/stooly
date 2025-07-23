console.log('[FILE LOADED: 6-paywall.tsx]');
import React, { useState, useEffect, useCallback } from 'react';
console.log('[PAYWALL_IMPORT] React hooks imported');
import {
  Alert,
  SafeAreaView,
  ActivityIndicator,
  View,
  Text,
  Pressable,
  Image,
} from 'react-native';
console.log('[PAYWALL_IMPORT] React Native components imported');
import { useSafeAreaInsets } from 'react-native-safe-area-context';
console.log('[PAYWALL_IMPORT] useSafeAreaInsets imported');
import { useRouter } from 'expo-router';
console.log('[PAYWALL_IMPORT] useRouter imported');
import { revenueCatService, PACKAGE_ID, ENTITLEMENT_ID } from '@/services/revenueCatService';
console.log('[PAYWALL_IMPORT] RevenueCat service imported');
import { PURCHASES_ERROR_CODE } from 'react-native-purchases';
console.log('[PAYWALL_IMPORT] Purchases error codes imported');

const MINIMUM_BOTTOM_PADDING = 34;

export default function PaywallScreen() {
  console.log('[PAYWALL_COMPONENT] PaywallScreen component called');
  const router = useRouter();
  console.log('[PAYWALL_COMPONENT] Router obtained');
  const insets = useSafeAreaInsets();
  console.log('[PAYWALL_COMPONENT] Safe area insets obtained');
  const [isPurchasing, setIsPurchasing] = useState(false);
  console.log('[PAYWALL_COMPONENT] State initialized');

  const setupPurchases = useCallback(async () => {
    console.log('[PAYWALL_SETUP] setupPurchases called');
    try {
      console.log('[PAYWALL_SETUP] Getting customer info');
      const customerInfo = await revenueCatService.getCustomerInfo();
      console.log('[PAYWALL_SETUP] Customer info received, checking entitlements');
      if (customerInfo.entitlements.active[ENTITLEMENT_ID]?.isActive) {
        console.log('[PAYWALL_SETUP] User has active subscription, redirecting to home');
        router.replace('/(protected)/home');
        return;
      }
      console.log('[PAYWALL_SETUP] No active subscription, getting offerings');
      const offerings = await revenueCatService.getOfferings();
      console.log('[PAYWALL_SETUP] Offerings received:', !!offerings.current);
      if (!offerings.current) throw new Error('No subscription options available');
    } catch (error: unknown) {
      console.error('[PAYWALL_SETUP] Error in setupPurchases:', error);
      Alert.alert('Subscription Error', 'Setting up subscriptions. Please try again soon.');
    }
  }, [router]);

  useEffect(() => {
    console.log('[PAYWALL_EFFECT] useEffect called - setting up purchases');
    void setupPurchases();
  }, [setupPurchases]);

  const handlePurchase = async () => {
    console.log('[PAYWALL_PURCHASE] handlePurchase called');
    setIsPurchasing(true);
    console.log('[PAYWALL_PURCHASE] Purchase state set to true');
    try {
      console.log('[PAYWALL_PURCHASE] Calling purchasePackage with:', PACKAGE_ID);
      const customerInfo = await revenueCatService.purchasePackage(PACKAGE_ID);
      console.log('[PAYWALL_PURCHASE] Purchase completed, checking entitlements');
      if (customerInfo?.entitlements.active[ENTITLEMENT_ID]?.isActive) {
        console.log('[PAYWALL_PURCHASE] Purchase successful, redirecting to home');
        router.replace('/(protected)/home');
      }
    } catch (e: any) {
      console.error('[PAYWALL_PURCHASE] Purchase error:', e);
      if (e.code !== PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
        console.log('[PAYWALL_PURCHASE] Showing purchase error alert');
        Alert.alert('Purchase Error', e.message);
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    try {
      const customerInfo = await revenueCatService.restorePurchases();
      const hasSub = customerInfo.entitlements.active[ENTITLEMENT_ID]?.isActive;
      if (hasSub) router.replace('/(protected)/home');
      else Alert.alert('Restore Purchase', 'No subscription found to restore.');
    } catch {
      Alert.alert('Restore Purchase', 'Couldn\'t restore purchases. Please try again.');
    }
  };

  const openLink = (url: string) => router.push(url as any);

  return (
    <SafeAreaView className="flex-1 bg-[#f4f1f4]">
      {/* Restore */}
      <Pressable
        onPress={handleRestore}
        hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
        className="absolute right-[26px] z-10 py-1"
        style={{ top: insets.top > 0 ? insets.top : 20 }}
      >
        <Text className="text-[#6D6D6D] underline text-base leading-5 font-medium">Restore</Text>
      </Pressable>

      {/* Header & image */}
      <View className="items-center w-full">
        <Text className="text-center text-[#111] text-[32px] font-bold mt-10 mb-3 px-6">We want you to try Stooly.</Text>
        <Image
          source={require('@/assets/images/cover.png')}
          resizeMode="contain"
          className="w-[450px] h-[450px] mb-5"
        />
      </View>

      {/* Bottom Sheet */}
      <View
        className="absolute left-0 right-0 bottom-0 bg-[#f4f1f4] rounded-t-3xl px-6 pt-8"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 10,
          paddingBottom: Math.max(insets.bottom, MINIMUM_BOTTOM_PADDING),
        }}
      >
        <Pressable
          onPress={handlePurchase}
          disabled={isPurchasing}
          className="h-[56px] rounded-2xl bg-black justify-center items-center mb-4"
          accessibilityRole="button"
        >
          {isPurchasing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-xl">Try For 7 Days</Text>
          )}
        </Pressable>

        {/* Links */}
        <View className="w-full flex-row justify-between h-5 mb-1 px-1">
          <Pressable onPress={() => openLink('https://www.shitventures.xyz/terms')} hitSlop={linkHitSlop}>
            <Text className="text-[#6D6D6D] underline text-base font-medium">Terms</Text>
          </Pressable>
          <Pressable onPress={() => openLink('https://www.shitventures.xyz/privacy')} hitSlop={linkHitSlop}>
            <Text className="text-[#6D6D6D] underline text-base font-medium">Privacy</Text>
          </Pressable>
        </View>

        <Text className="text-[#6D6D6D] text-center mb-8 text-sm leading-5 font-medium">Renews at $6.99 per week.</Text>
      </View>
    </SafeAreaView>
  );
}

const linkHitSlop = { top: 12, bottom: 12, left: 8, right: 8 };