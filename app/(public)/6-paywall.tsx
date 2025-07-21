import { StyleSheet, Alert, Platform, SafeAreaView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { revenueCatService, PACKAGE_ID, ENTITLEMENT_ID } from '@/services/revenueCatService';
import { PURCHASES_ERROR_CODE } from 'react-native-purchases';
import {
  Box,
  Text,
  Button,
  ButtonText,
  Image,
  Pressable,
  VStack,
  HStack,
} from '@gluestack-ui/themed';
import { moderateScale } from '@/styles/sizing';

// Layout constants
const BUTTON_HEIGHT = 56;
const MINIMUM_BOTTOM_PADDING = 34;

export default function PaywallScreen() {
  const router = useRouter();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    void setupPurchases();
  }, []);

  async function setupPurchases() {
    try {
      // Check existing entitlements first
      const customerInfo = await revenueCatService.getCustomerInfo();
      
      if (customerInfo.entitlements.active[ENTITLEMENT_ID]?.isActive) {
        router.replace('/(protected)/home');
        return;
      }

      // Fetch offerings
      const offerings = await revenueCatService.getOfferings();
      
      if (!offerings.current) {
        throw new Error('No subscription options available');
      }

    } catch (error) {
      let errorMessage = 'Setting up subscriptions. Please try again soon.';
      
      if (error instanceof Error) {
        switch (error.message) {
          case 'No subscription options available':
            errorMessage = 'Can\'t load subscription options. Check your internet and try again.';
            break;
          case 'RevenueCat not initialized':
            errorMessage = 'Setting up subscriptions. Please try again soon.';
            break;
        }
      }
      
      Alert.alert('Subscription Error', errorMessage);
    }
  }

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
      const hasSubscription = customerInfo.entitlements.active[ENTITLEMENT_ID]?.isActive;
      
      if (hasSubscription) {
        router.replace('/(protected)/home');
      } else {
        Alert.alert('Restore Purchase', 'No subscription found to restore.');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      Alert.alert('Restore Purchase', 'Couldn\'t restore purchases. Please try again.');
    }
  };

  const handleTermsPress = () => {
    router.push('https://www.shitventures.xyz/terms');
  };

  const handlePrivacyPress = () => {
    router.push('https://www.shitventures.xyz/privacy');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Pressable
        onPress={handleRestore}
        position="absolute"
        right={26}
        zIndex={10}
        paddingVertical={4}
        hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
        sx={{ top: insets.top > 0 ? insets.top : 20 }}
      >
        <Text
          color="#6D6D6D"
          textAlign="center"
          textDecorationLine="underline"
          fontWeight="$medium"
          sx={{ fontSize: moderateScale(15), lineHeight: 20 }}
        >
          Restore
        </Text>
      </Pressable>
      <Box alignItems="center" width="100%">
        <Box paddingHorizontal={26} width="100%" marginTop={40}>
          <Text
            textAlign="center"
            color="$primaryText"
            marginBottom={12}
            fontWeight="$bold"
            sx={{ fontSize: moderateScale(32) }}
          >
            We want you to try Stooly.
          </Text>
        </Box>
        <Box
          marginBottom={20}
          width="100%"
          alignItems="center"
          paddingHorizontal={26}
        >
          <Image
            source={require('@/assets/images/cover.png')}
            alt="A cartoon poop emoji in a toilet."
            resizeMode="contain"
            sx={{ width: 425, height: 425 }}
          />
        </Box>
      </Box>
      
      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        backgroundColor="#f4f1f4"
        borderTopLeftRadius={24}
        borderTopRightRadius={24}
        paddingHorizontal={24}
        paddingTop={20}
        zIndex={2}
        sx={{
          paddingBottom: Math.max(insets.bottom, MINIMUM_BOTTOM_PADDING),
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 10,
        }}
      >
        <Box justifyContent="flex-end">
          <Box paddingTop={16}>
            <VStack gap={8}>
              <Button
                height={BUTTON_HEIGHT}
                backgroundColor="#010103"
                borderRadius={16}
                justifyContent="center"
                alignItems="center"
                marginBottom={8}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                onPress={handlePurchase}
                disabled={isPurchasing}
              >
                {isPurchasing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <ButtonText
                    color="$white"
                    fontWeight="$bold"
                    sx={{ fontSize: moderateScale(20) }}
                  >
                    Try For 7 Days
                  </ButtonText>
                )}
              </Button>

              <Box
                width="100%"
                height={20}
                marginBottom={6}
                paddingHorizontal={4}
              >
                <Pressable 
                  onPress={handleTermsPress}
                  hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
                  position="absolute"
                  left={4}
                >
                  <Text
                    color="#6D6D6D"
                    textDecorationLine="underline"
                    fontWeight="$medium"
                    sx={{ fontSize: moderateScale(15) }}
                  >
                    Terms
                  </Text>
                </Pressable>
                <Pressable 
                  onPress={handlePrivacyPress}
                  hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
                  position="absolute"
                  right={4}
                >
                  <Text
                    color="#6D6D6D"
                    textDecorationLine="underline"
                    fontWeight="$medium"
                    sx={{ fontSize: moderateScale(15) }}
                  >
                    Privacy
                  </Text>
                </Pressable>
              </Box>

              <Text
                color="#6D6D6D"
                textAlign="center"
                marginBottom={30}
                fontWeight="$medium"
                sx={{ fontSize: moderateScale(14), lineHeight: 20 }}
              >
                Renews at $6.99 per week.
              </Text>
            </VStack>
          </Box>
        </Box>
      </Box>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f1f4',
  },
}); 