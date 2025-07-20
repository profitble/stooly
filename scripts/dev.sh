#!/bin/bash

echo "🔧 Setting up development environment with paywall disabled..."

# Backup current RevenueCat service if it doesn't exist
if [ ! -f services/revenueCatService.ts.backup ]; then
    echo "📦 Backing up production RevenueCat service..."
    cp services/revenueCatService.ts services/revenueCatService.ts.backup
fi

# Backup current index.tsx if it doesn't exist  
if [ ! -f app/index.tsx.backup ]; then
    echo "📦 Backing up production index.tsx..."
    cp app/index.tsx app/index.tsx.backup
fi

# Create development RevenueCat service that always returns active subscription
echo "🚫 Disabling paywall for development..."
cat > services/revenueCatService.ts << 'EOL'
import Purchases, { 
  LOG_LEVEL, 
  CustomerInfo, 
  PurchasesError,
  PurchasesPackage,
  PurchasesOfferings
} from 'react-native-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getOrCreateAppUserId } from '@/utils/userId';

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
    // DEV: Always return success, skip actual RevenueCat initialization
    this.isInitialized = true;
    return { success: true };
  }

  async getOfferings(): Promise<PurchasesOfferings> {
    // DEV: Return mock offerings
    return { current: null } as PurchasesOfferings;
  }

  async getCustomerInfo(): Promise<CustomerInfo> {
    // DEV: Always return active subscription
    const now = new Date().toISOString();
    const future = new Date(2099, 11, 31).toISOString();
    return {
      entitlements: {
        active: {
          [ENTITLEMENT_ID]: {
            identifier: ENTITLEMENT_ID,
            isActive: true,
            willRenew: true,
            periodType: "NORMAL",
            latestPurchaseDate: now,
            originalPurchaseDate: now,
            expirationDate: future,
          }
        }
      },
      firstSeen: now,
      originalAppUserId: 'dev_user',
      requestDate: now,
      activeSubscriptions: [PACKAGE_ID],
      allPurchasedProductIdentifiers: [PACKAGE_ID],
      latestExpirationDate: future,
      originalApplicationVersion: "1.0",
      originalPurchaseDate: now,
      managementURL: null,
      nonSubscriptionTransactions: [],
      allExpirationDates: { [PACKAGE_ID]: future },
      allPurchaseDates: { [PACKAGE_ID]: now }
    } as unknown as CustomerInfo;
  }

  async purchasePackage(packageIdentifier: string): Promise<CustomerInfo> {
    // DEV: Always return active subscription
    return this.getCustomerInfo();
  }

  async restorePurchases(): Promise<CustomerInfo> {
    // DEV: Always return active subscription
    return this.getCustomerInfo();
  }

  async isSubscribed(): Promise<boolean> {
    // DEV: Always return true
    return true;
  }
}

export const revenueCatService = RevenueCatService.getInstance();
EOL

# Update index.tsx to skip paywall in development
echo "🏠 Updating app entry point to skip paywall..."
cat > app/index.tsx << 'EOL'
import { Redirect } from 'expo-router';

export default function Index() {
  // DEV: Skip paywall, go directly to protected home
  return <Redirect href="/(protected)/home" />;
}
EOL

echo "✅ Development environment ready!"
echo "🚀 Paywall is now DISABLED for development"
echo "📝 Run 'bash scripts/prod.sh' to restore production settings"