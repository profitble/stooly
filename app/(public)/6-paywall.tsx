import React, { useState, useEffect, useCallback } from 'react';
import {
  Alert,
  SafeAreaView,
  ActivityIndicator,
  View,
  Text,
  Pressable,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { revenueCatService, PACKAGE_ID, ENTITLEMENT_ID } from '@/services/revenueCatService';
import { PURCHASES_ERROR_CODE } from 'react-native-purchases';

const MINIMUM_BOTTOM_PADDING = 34;

export default function PaywallScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isPurchasing, setIsPurchasing] = useState(false);

  const setupPurchases = useCallback(async () => {
    try {
      const customerInfo = await revenueCatService.getCustomerInfo();
      if (customerInfo.entitlements.active[ENTITLEMENT_ID]?.isActive) {
        router.replace('/(protected)/home');
        return;
      }
      const offerings = await revenueCatService.getOfferings();
      if (!offerings.current) throw new Error('No subscription options available');
    } catch (error: unknown) {
      Alert.alert('Subscription Error', 'Setting up subscriptions. Please try again soon.');
    }
  }, [router]);

  useEffect(() => {
    void setupPurchases();
  }, [setupPurchases]);

  const handlePurchase = async () => {
    setIsPurchasing(true);
    try {
      const customerInfo = await revenueCatService.purchasePackage(PACKAGE_ID);
      if (customerInfo?.entitlements.active[ENTITLEMENT_ID]?.isActive) {
        router.replace('/(protected)/home');
      }
    } catch (e: any) {
      if (e.code !== PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
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