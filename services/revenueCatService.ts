import Purchases from 'react-native-purchases';
import type { CustomerInfo, PurchasesError, PurchasesPackage, PurchasesOfferings } from 'react-native-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getOrCreateAppUserId } from '@/utils/userId';
import { Platform } from 'react-native';

const RETRY_ATTEMPTS = 3;
const INITIAL_RETRY_DELAY = 1000;
const MAX_RETRY_DELAY = 5000;

export const ENTITLEMENT_ID = 'stooly_unlimited';
export const PACKAGE_ID = '$rc_weekly';

interface InitializationResult {
  success: boolean;
  error?: Error;
}

class RevenueCatService {
  private static instance: RevenueCatService;
  private isInitialized = false;
  private appUserId: string | null = null;

  private constructor() {
  }

  static getInstance(): RevenueCatService {
    if (!RevenueCatService.instance) {
      RevenueCatService.instance = new RevenueCatService();
    }
    return RevenueCatService.instance;
  }

  async initialize(): Promise<InitializationResult> {
    if (this.isInitialized) {
      return { success: true };
    }
    
    // Defensive check: ensure we're not initializing too early
    if (!process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS) {
      return {
        success: false,
        error: new Error('Environment not ready - RevenueCat API key not available')
      };
    }

    let lastError: Error | undefined;
    let currentDelay = INITIAL_RETRY_DELAY;

    for (let attempt = 0; attempt < RETRY_ATTEMPTS; attempt++) {
      try {
        const apiKey = Platform.select({
          ios: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS,
          default: null,
        });

        if (apiKey == null) {
          throw new Error('RevenueCat API key not configured for this platform');
        }

        await Purchases.configure({ apiKey });
        
        // Generate or retrieve secure app user ID
        this.appUserId = await getOrCreateAppUserId();
        
        await Purchases.logIn(this.appUserId);
        
        await Purchases.getCustomerInfo();
        
        // Set email notification preferences to opted out
        await Purchases.setAttributes({
          $email_notification_state: 'opted_out',
          $displayName: await AsyncStorage.getItem('user_name') || ''
        });
        
        this.isInitialized = true;
        return { success: true };
      } catch (error: unknown) {
        lastError = error instanceof Error ? error : new Error(String(error as unknown));
        
        if (attempt < RETRY_ATTEMPTS - 1) {
          await new Promise(resolve => setTimeout(resolve, currentDelay));
          currentDelay = Math.min(currentDelay * 2, MAX_RETRY_DELAY);
        }
      }
    }

    return {
      success: false,
      error: lastError ?? new Error('Failed to initialize RevenueCat after multiple attempts')
    };
  }

  async getOfferings(): Promise<PurchasesOfferings> {
    if (!this.isInitialized) {
      const initResult = await this.initialize();
      if (!initResult.success) {
        throw initResult.error;
      }
    }

    try {
      const offerings = await Purchases.getOfferings();
      if (!offerings.current) {
        throw new Error('No subscription options available');
      }
      return offerings;
    } catch (error) {
      throw error;
    }
  }

  async getCustomerInfo(): Promise<CustomerInfo> {
    if (!this.isInitialized) {
      const initResult = await this.initialize();
      if (!initResult.success) {
        throw initResult.error;
      }
    }

    return Purchases.getCustomerInfo();
  }

  async purchasePackage(packageIdentifier: string): Promise<CustomerInfo> {
    if (!this.isInitialized) {
      const initResult = await this.initialize();
      if (!initResult.success) {
        throw initResult.error;
      }
    }

    try {
      const offerings = await this.getOfferings();
      const pkg = offerings.current?.availablePackages.find(
        (p: PurchasesPackage) => p.identifier === packageIdentifier
      );
      
      if (!pkg) {
        throw new Error(`Subscription package not available`);
      }

      const { customerInfo } = await Purchases.purchasePackage(pkg);
      return customerInfo;
    } catch (error) {
      if ((error as PurchasesError).userCancelled) {
        throw new Error('Purchase cancelled by user');
      }
      throw error;
    }
  }

  async restorePurchases(): Promise<CustomerInfo> {
    if (!this.isInitialized) {
      const initResult = await this.initialize();
      if (!initResult.success) {
        throw initResult.error;
      }
    }

    try {
      const customerInfo = await Purchases.restorePurchases();
      return customerInfo;
    } catch (error) {
      throw error;
    }
  }


  async isSubscribed(): Promise<boolean> {
    try {
      const customerInfo = await this.getCustomerInfo();
      return customerInfo.entitlements.active[ENTITLEMENT_ID]?.isActive === true;
    } catch (error) {
      return false;
    }
  }
}

export const revenueCatService = RevenueCatService.getInstance();