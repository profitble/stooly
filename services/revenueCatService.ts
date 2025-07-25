import Purchases from 'react-native-purchases';
import type { CustomerInfo, PurchasesError, PurchasesOfferings } from 'react-native-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getOrCreateAppUserId } from '@/utils/userId';
import { Platform } from 'react-native';

export const ENTITLEMENT_ID = 'stooly_unlimited';
export const PACKAGE_ID = '$rc_weekly';

const RETRY_ATTEMPTS = 3;
const INITIAL_RETRY_DELAY = 1000;
const MAX_RETRY_DELAY = 5000;

class RevenueCatService {
  private static instance: RevenueCatService;
  private isInitialized = false;
  private appUserId: string | null = null;
  private activeSubscriptionCheck: Promise<boolean> | null = null;

  private constructor() {}

  static getInstance(): RevenueCatService {
    if (!RevenueCatService.instance) {
      RevenueCatService.instance = new RevenueCatService();
    }
    return RevenueCatService.instance;
  }

  async initialize(): Promise<{ success: boolean; error?: Error }> {
    if (this.isInitialized) return { success: true };

    const apiKey = Platform.select({
      ios: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS,
      default: null
    });

    if (!apiKey) {
      return { success: false, error: new Error('Missing RevenueCat API key for platform.') };
    }

    let lastError: Error | undefined;
    let delay = INITIAL_RETRY_DELAY;

    for (let i = 0; i < RETRY_ATTEMPTS; i++) {
      try {
        await Purchases.configure({ apiKey });

        this.appUserId = await getOrCreateAppUserId();
        await Purchases.logIn(this.appUserId);
        await Purchases.getCustomerInfo(); // Warm-up

        await Purchases.setAttributes({
          $email_notification_state: 'opted_out',
          $displayName: (await AsyncStorage.getItem('user_name')) || ''
        });

        this.isInitialized = true;
        return { success: true };
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (i < RETRY_ATTEMPTS - 1) {
          await new Promise((res) => setTimeout(res, delay));
          delay = Math.min(delay * 2, MAX_RETRY_DELAY);
        }
      }
    }

    return {
      success: false,
      error: lastError ?? new Error('RevenueCat initialization failed.')
    };
  }

  private async ensureInitialized() {
    const result = await this.initialize();
    if (!result.success) throw result.error;
  }

  async getOfferings(): Promise<PurchasesOfferings> {
    await this.ensureInitialized();
    const offerings = await Purchases.getOfferings();
    if (!offerings.current) throw new Error('No current offering found');
    return offerings;
  }

  async getCustomerInfo(): Promise<CustomerInfo> {
    await this.ensureInitialized();
    return Purchases.getCustomerInfo();
  }

  async purchasePackage(packageId: string): Promise<CustomerInfo> {
    await this.ensureInitialized();

    const offerings = await this.getOfferings();
    const pkg = offerings.current?.availablePackages.find(p => p.identifier === packageId);
    if (!pkg) throw new Error('Subscription package not found');

    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      return customerInfo;
    } catch (err) {
      if ((err as PurchasesError).userCancelled) throw new Error('User cancelled purchase');
      throw err;
    }
  }

  async restorePurchases(): Promise<CustomerInfo> {
    await this.ensureInitialized();
    return Purchases.restorePurchases();
  }

  async isSubscribed(): Promise<boolean> {
    if (this.activeSubscriptionCheck) return this.activeSubscriptionCheck;

    this.activeSubscriptionCheck = this.checkEntitlement();
    try {
      return await this.activeSubscriptionCheck;
    } finally {
      this.activeSubscriptionCheck = null;
    }
  }

  private async checkEntitlement(): Promise<boolean> {
    try {
      await Purchases.invalidateCustomerInfoCache();
      const info = await this.getCustomerInfo();
      return info.entitlements.active[ENTITLEMENT_ID]?.isActive === true;
    } catch {
      return false;
    }
  }
}

export const revenueCatService = RevenueCatService.getInstance();