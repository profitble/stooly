import { StyleSheet, Image, Dimensions, Alert, BackHandler, Pressable, Platform, SafeAreaView, ActivityIndicator } from 'react-native';
import { Text, Button, ButtonText, HStack, View, VStack } from '@gluestack-ui/themed';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import type { PurchasesOffering } from 'react-native-purchases';
import { revenueCatService, PACKAGE_ID, ENTITLEMENT_ID } from '@/services/revenueCatService';
import { ArrowRight, CheckCircle, Lock } from 'phosphor-react-native';
import { themeColors } from '@/styles/theme';
import { PURCHASES_ERROR_CODE } from 'react-native-purchases';
import { headingLarge, buttonText, bodySmall } from '@/styles/fonts';

// Layout constants
const { height } = Dimensions.get('window');
const IMAGE_HEIGHT = Math.min(height * 0.65, 450);
const BUTTON_HEIGHT = 56;
const MINIMUM_BOTTOM_PADDING = 34;

const isIPad = Platform.OS === 'ios' && Platform.isPad;

export default function PaywallScreen() {
  const router = useRouter();
  const { transition } = useLocalSearchParams<{ transition?: string }>();
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const insets = useSafeAreaInsets();
  const [isRestoring, setIsRestoring] = useState(false);

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

      setOffering(offerings.current);
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
        style={[styles.restoreButton, { position: 'absolute', top: insets.top > 0 ? insets.top : 20, right: 26, zIndex: 10 }]}
        hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
      >
        <Text style={styles.restoreText}>
          Restore
        </Text>
      </Pressable>
      <View style={styles.contentWrapper}>
        <View style={styles.textWrapper}>
          <Text style={styles.title}>We want you to try Stooly.</Text>
        </View>
        <View style={styles.heroWrapper}>
          <Image
            source={require('@/assets/images/cover.png')}
            style={styles.hero}
            resizeMode="contain"
          />
        </View>
      </View>
      
      <View style={[
        styles.overlay,
        { 
          paddingBottom: Math.max(insets.bottom, MINIMUM_BOTTOM_PADDING),
        }
      ]}>
        <View style={styles.content}>

          <View style={styles.bottomContent}>
            <VStack style={{ gap: 8 }}>
              <Button
                style={[styles.trialButton, { minHeight: BUTTON_HEIGHT }]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                onPress={handlePurchase}
                disabled={isPurchasing}
              >
                {isPurchasing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <ButtonText style={styles.trialButtonText}>
                    Try For 7 Days
                  </ButtonText>
                )}
              </Button>

              <HStack style={styles.linksContainer}>
                <Pressable 
                  onPress={handleTermsPress}
                  hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
                >
                  <Text style={styles.linkText}>Terms</Text>
                </Pressable>
                <Pressable 
                  onPress={handlePrivacyPress}
                  hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
                >
                  <Text style={styles.linkText}>Privacy</Text>
                </Pressable>
              </HStack>

              <Text 
                style={styles.pricingText}
              >
                Renews at $6.99 per week
              </Text>
            </VStack>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f1f4',
  },
  contentWrapper: {
    alignItems: 'center',
    width: '100%',
  },
  textWrapper: {
    paddingHorizontal: 26,
    width: '100%',
    marginTop: 40,
  },
  title: {
    fontSize: 32,
    ...headingLarge,
    textAlign: 'center',
    color: '#111',
    marginBottom: 12,
  },
  heroWrapper: {
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 26,
  },
  hero: {
    width: 425,
    height: 425,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f4f1f4', // match 2-gender.tsx
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    paddingHorizontal: 24,
    paddingTop: 20,
    zIndex: 2
  },
  content: {
    justifyContent: 'flex-end',
  },
  bottomContent: {
    paddingTop: 16,
  },
  verse: {
    fontSize: 14,
    color: '#111', // match 2-gender.tsx title
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.8,
  },
  greeting: {
    fontSize: 22,
    color: '#111', // match 2-gender.tsx title
    marginBottom: 8,
    lineHeight: 28,
    fontFamily: 'Merriweather-Italic',
  },
  message: {
    fontSize: 13,
    color: '#111', // match 2-gender.tsx subtitle
    marginBottom: 8,
    lineHeight: 18,
  },
  benefitsText: {
    fontSize: 13,
    color: '#111', // match 2-gender.tsx subtitle
    marginBottom: 8,
    lineHeight: 18,
  },
  notificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f4f1f4', // match 2-gender.tsx
    padding: 12,
    borderRadius: 12,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#ede9f1', // match 2-gender.tsx backBtn
    width: '100%',
  },
  notificationText: {
    fontSize: 13,
    color: '#111', // match 2-gender.tsx subtitle
    flex: 1,
    marginRight: 12,
    lineHeight: 18,
  },
  trialButton: {
    backgroundColor: '#010103',
    height: BUTTON_HEIGHT,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  trialButtonText: {
    fontSize: 20,
    ...buttonText,
    color: '#fff',
  },
  pricingText: {
    fontSize: 15,
    color: '#6D6D6D',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
    ...bodySmall,
  },
  restoreButton: {
    paddingVertical: 4,
  },
  restoreText: {
    fontSize: 15,
    color: '#6D6D6D',
    textAlign: 'center',
    lineHeight: 20,
    textDecorationLine: 'underline',
    ...buttonText,
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 6,
  },
  linkText: {
    fontSize: 15,
    color: '#6D6D6D',
    textDecorationLine: 'underline',
    ...buttonText,
  },
}); 