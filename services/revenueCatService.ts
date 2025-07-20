import Purchases, { 
  LOG_LEVEL, 
  CustomerInfo, 
  PurchasesError,
  PurchasesPackage,
  PurchasesOfferings
} from 'react-native-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  private constructor() {}

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

    let lastError: Error | undefined;
    let currentDelay = INITIAL_RETRY_DELAY;

    for (let attempt = 0; attempt < RETRY_ATTEMPTS; attempt++) {
      try {
        if (__DEV__) {
          Purchases.setLogLevel(LOG_LEVEL.DEBUG);
        }

        const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS;
        if (!apiKey) {
          throw new Error('RevenueCat API key not configured');
        }

        await Purchases.configure({ apiKey });
        await Purchases.getCustomerInfo();
        
        // Set email notification preferences to opted out
        await Purchases.setAttributes({
          $email_notification_state: 'opted_out',
          $displayName: await AsyncStorage.getItem('user_name') || ''
        });
        
        this.isInitialized = true;
        return { success: true };
      } catch (error) {
        if (__DEV__) {
          console.warn(`RevenueCat initialization attempt ${attempt + 1} failed:`, error);
        }
        lastError = error instanceof Error ? error : new Error(String(error));
        
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
      if (__DEV__) {
        console.error('Failed to fetch offerings:', error);
      }
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
      if (__DEV__) {
        console.error('Failed to restore purchases:', error);
      }
      throw error;
    }
  }
}

export const revenueCatService = RevenueCatService.getInstance(); 