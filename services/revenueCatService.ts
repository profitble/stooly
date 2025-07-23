console.log('[FILE LOADED: revenueCatService.ts]');
import Purchases from 'react-native-purchases';
console.log('[RC_IMPORT] Purchases imported');
import type { CustomerInfo, PurchasesError, PurchasesPackage, PurchasesOfferings } from 'react-native-purchases';
console.log('[RC_IMPORT] Purchases types imported');
import AsyncStorage from '@react-native-async-storage/async-storage';
console.log('[RC_IMPORT] AsyncStorage imported');
import { getOrCreateAppUserId } from '@/utils/userId';
console.log('[RC_IMPORT] getOrCreateAppUserId imported');
import { Platform } from 'react-native';
console.log('[RC_IMPORT] Platform imported');

const RETRY_ATTEMPTS = 3;
const INITIAL_RETRY_DELAY = 1000;
const MAX_RETRY_DELAY = 5000;
console.log('[RC_CONSTANTS] Retry configuration loaded - attempts:', RETRY_ATTEMPTS);

// RevenueCat Configuration Constants
export const ENTITLEMENT_ID = 'stooly_unlimited';
export const PACKAGE_ID = '$rc_weekly';
export const OFFERING_ID = 'current';
console.log('[RC_CONSTANTS] RevenueCat constants defined:', {ENTITLEMENT_ID, PACKAGE_ID, OFFERING_ID});

interface InitializationResult {
  success: boolean;
  error?: Error;
}

class RevenueCatService {
  private static instance: RevenueCatService;
  private isInitialized = false;
  private appUserId: string | null = null;

  private constructor() {
    console.log('[RC_CLASS] RevenueCatService constructor called');
  }

  static getInstance(): RevenueCatService {
    console.log('[RC_SINGLETON] getInstance called, exists:', !!RevenueCatService.instance);
    if (!RevenueCatService.instance) {
      console.log('[RC_SINGLETON] Creating new RevenueCatService instance');
      RevenueCatService.instance = new RevenueCatService();
    }
    return RevenueCatService.instance;
  }

  async initialize(): Promise<InitializationResult> {
    console.log('[RC_INIT_START] Initialize called, already initialized:', this.isInitialized);
    if (this.isInitialized) {
      console.log('[RC_INIT_SKIP] Already initialized, returning success');
      return { success: true };
    }

    console.log('[RC_ENV] Checking environment variables');
    console.log('[RC_ENV] process.env exists:', typeof process.env);
    console.log('[RC_ENV] iOS key present:', !!process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS);
    
    // Defensive check: ensure we're not initializing too early
    if (!process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS) {
      console.error('[RC_ENV] RevenueCat API key not available in environment');
      return {
        success: false,
        error: new Error('Environment not ready - RevenueCat API key not available')
      };
    }

    let lastError: Error | undefined;
    let currentDelay = INITIAL_RETRY_DELAY;
    console.log('[RC_RETRY] Starting retry loop, max attempts:', RETRY_ATTEMPTS);

    for (let attempt = 0; attempt < RETRY_ATTEMPTS; attempt++) {
      console.log('[RC_ATTEMPT]', attempt + 1, 'of', RETRY_ATTEMPTS);
      try {
        console.log('[RC_PLATFORM] Checking platform for API key');
        console.log('[RC_PLATFORM] Platform.OS:', Platform.OS);
        const apiKey = Platform.select({
          ios: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS,
          default: null,
        });
        console.log('[RC_PLATFORM] Selected API key exists:', !!apiKey);

        if (apiKey == null) {
          console.error('[RC_PLATFORM] RevenueCat API key not configured for platform:', Platform.OS);
          throw new Error('RevenueCat API key not configured for this platform');
        }

        console.log('[RC_CONFIGURE] Calling Purchases.configure with API key');
        await Purchases.configure({ apiKey });
        console.log('[RC_CONFIGURE] Purchases.configure completed successfully');
        
        console.log('[RC_USER_ID] Getting or creating app user ID');
        // Generate or retrieve secure app user ID
        this.appUserId = await getOrCreateAppUserId();
        console.log('[RC_USER_ID] App user ID obtained:', !!this.appUserId);
        
        console.log('[RC_LOGIN] Calling Purchases.logIn');
        await Purchases.logIn(this.appUserId);
        console.log('[RC_LOGIN] Purchases.logIn completed');
        
        console.log('[RC_CUSTOMER] Getting customer info');
        await Purchases.getCustomerInfo();
        console.log('[RC_CUSTOMER] Customer info retrieved successfully');
        
        console.log('[RC_ATTRIBUTES] Setting user attributes');
        // Set email notification preferences to opted out
        await Purchases.setAttributes({
          $email_notification_state: 'opted_out',
          $displayName: await AsyncStorage.getItem('user_name') || ''
        });
        console.log('[RC_ATTRIBUTES] User attributes set successfully');
        
        this.isInitialized = true;
        console.log('[RC_INIT_SUCCESS] RevenueCat initialization completed successfully');
        return { success: true };
      } catch (error: unknown) {
        lastError = error instanceof Error ? error : new Error(String(error as unknown));
        console.error('[RC_ERROR] Attempt', attempt + 1, 'failed:', lastError.message);
        
        if (attempt < RETRY_ATTEMPTS - 1) {
          console.log('[RC_RETRY] Waiting', currentDelay, 'ms before retry');
          await new Promise(resolve => setTimeout(resolve, currentDelay));
          currentDelay = Math.min(currentDelay * 2, MAX_RETRY_DELAY);
          console.log('[RC_RETRY] Next delay will be:', Math.min(currentDelay * 2, MAX_RETRY_DELAY));
        }
      }
    }

    console.error('[RC_INIT_FAILED] All retry attempts exhausted');
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

console.log('[RC_EXPORT] Creating RevenueCatService singleton instance');
export const revenueCatService = RevenueCatService.getInstance();
console.log('[RC_EXPORT] RevenueCatService instance exported');