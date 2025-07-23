console.log('[BOOT] FILE LOADED: services/revenueCatService.ts');
import Purchases from 'react-native-purchases';
import type { CustomerInfo, PurchasesError, PurchasesPackage, PurchasesOfferings } from 'react-native-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getOrCreateAppUserId } from '@/utils/userId';
import { Platform } from 'react-native';

const RETRY_ATTEMPTS = 3;
const INITIAL_RETRY_DELAY = 1000;
const MAX_RETRY_DELAY = 5000;


// RevenueCat Configuration Constants
export const ENTITLEMENT_ID = 'stooly_unlimited';
export const PACKAGE_ID = '$rc_weekly';
export const OFFERING_ID = 'current';

interface InitializationResult {
  success: boolean;
  error?: Error;
}

class RevenueCatService {
  private static instance: RevenueCatService;
  private isInitialized = false;
  private appUserId: string | null = null;

  private constructor() {}

  static getInstance(): RevenueCatService {
    if (!RevenueCatService.instance) {
      RevenueCatService.instance = new RevenueCatService();
    }
    return RevenueCatService.instance;
  }

  async initialize(): Promise<InitializationResult> {
    console.log('[RC] Initializing RevenueCat...');
    
    if (this.isInitialized) {
      console.log('[RC] Already initialized, returning success');
      return { success: true };
    }

    // Defensive check: ensure we're not initializing too early
    const apiKeyIOS = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS;
    console.log('[RC] API Key iOS defined:', !!apiKeyIOS, 'Length:', apiKeyIOS?.length || 0);
    
    if (!apiKeyIOS) {
      console.log('[RC] Environment not ready - RevenueCat API key not available');
      return {
        success: false,
        error: new Error('Environment not ready - RevenueCat API key not available')
      };
    }

    let lastError: Error | undefined;
    let currentDelay = INITIAL_RETRY_DELAY;

    for (let attempt = 0; attempt < RETRY_ATTEMPTS; attempt++) {
      console.log(`[RC] Attempt ${attempt + 1}/${RETRY_ATTEMPTS}`);
      
      try {
        const apiKey = Platform.select({
          ios: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS,
          default: null,
        });
        
        console.log('[RC] Platform:', Platform.OS, 'API Key selected:', !!apiKey);

        if (apiKey == null) {
          throw new Error('RevenueCat API key not configured for this platform');
        }

        console.log('[RC] Configuring Purchases with API key...');
        await Purchases.configure({ apiKey });
        console.log('[RC] Purchases configured successfully');
        
        // Generate or retrieve secure app user ID
        console.log('[RC] Getting app user ID...');
        this.appUserId = await getOrCreateAppUserId();
        console.log('[RC] App user ID:', this.appUserId ? `${this.appUserId.substring(0, 8)}...` : 'null');
        
        console.log('[RC] Logging in user...');
        await Purchases.logIn(this.appUserId);
        console.log('[RC] User logged in successfully');
        
        console.log('[RC] Getting customer info...');
        await Purchases.getCustomerInfo();
        console.log('[RC] Customer info retrieved successfully');
        
        // Set email notification preferences to opted out
        console.log('[RC] Setting user attributes...');
        const userName = await AsyncStorage.getItem('user_name') || '';
        console.log('[RC] User name from storage:', userName ? `"${userName}"` : 'empty');
        
        await Purchases.setAttributes({
          $email_notification_state: 'opted_out',
          $displayName: userName
        });
        console.log('[RC] User attributes set successfully');
        
        this.isInitialized = true;
        console.log('[RC] RevenueCat initialization completed successfully');
        return { success: true };
      } catch (error: unknown) {
        lastError = error instanceof Error ? error : new Error(String(error as unknown));
        console.log(`[RC] [ERROR] Attempt ${attempt + 1} failed:`, lastError.message);
        console.log(`[RC] [ERROR] Stack:`, lastError.stack || 'No stack trace');
        
        if (attempt < RETRY_ATTEMPTS - 1) {
          console.log(`[RC] Retrying in ${currentDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, currentDelay));
          currentDelay = Math.min(currentDelay * 2, MAX_RETRY_DELAY);
        }
      }
    }

    console.log('[RC] [ERROR] All retry attempts failed, giving up');
    return {
      success: false,
      error: lastError ?? new Error('Failed to initialize RevenueCat after multiple attempts')
    };
  }

  async getOfferings(): Promise<PurchasesOfferings> {
    console.log('[RC] Getting offerings...');
    
    if (!this.isInitialized) {
      console.log('[RC] Not initialized, attempting to initialize...');
      const initResult = await this.initialize();
      if (!initResult.success) {
        console.log('[RC] [ERROR] Initialization failed in getOfferings');
        throw initResult.error;
      }
    }

    try {
      console.log('[RC] Fetching offerings from RevenueCat...');
      const offerings = await Purchases.getOfferings();
      console.log('[RC] Offerings fetched, current offering available:', !!offerings.current);
      
      if (!offerings.current) {
        console.log('[RC] [ERROR] No current offering available');
        throw new Error('No subscription options available');
      }
      
      console.log('[RC] Offerings retrieved successfully');
      return offerings;
    } catch (error) {
      console.log('[RC] [ERROR] Failed to get offerings:', error instanceof Error ? error.message : String(error));
      console.log('[RC] [ERROR] Stack:', error instanceof Error ? error.stack || 'No stack' : 'No stack');
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