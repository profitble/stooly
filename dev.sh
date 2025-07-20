#!/bin/bash

echo "Setting up development environment..."

# Set development environment variables
export EXPO_NO_DOTENV=0
export EXPO_PUBLIC_DISABLE_AUTH=true

# Create or update .env.local file with development settings
if [ ! -f .env.local ] || ! grep -q "EXPO_PUBLIC_DISABLE_AUTH=true" .env.local; then
    echo "Configuring .env.local..."
    cat > .env.local << EOL
EXPO_PUBLIC_DISABLE_AUTH=true
EXPO_PUBLIC_API_BASE_URL=https://hatrkgxzjvyylebilaun.supabase.co/functions/v1
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhdHJrZ3h6anZ5eWxlYmlsYXVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkzMTMzMTAsImV4cCI6MjA1NDg4OTMxMH0.TeNwuLNrurf9lMFyE4_KIn9ezMPyKZgJS5gyTKYmn44
EXPO_PUBLIC_REVENUECAT_API_KEY_IOS=appl_UaQSEmnGSQBKNZDwacBdJHILbYT
EOL
fi

# Modify RevenueCat service to bypass auth in development
echo "Modifying RevenueCat service for development..."
cat > services/revenueCatService.ts << 'EOL'
import Purchases, { 
  LOG_LEVEL, 
  PurchasesOffering, 
  CustomerInfo, 
  PurchasesError,
  PurchasesPackage,
  PurchasesOfferings
} from 'react-native-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RETRY_ATTEMPTS = 3;
const INITIAL_RETRY_DELAY = 1000;
const MAX_RETRY_DELAY = 5000;

export const ENTITLEMENT_ID = 'theo_unlimited';
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
    this.isInitialized = true;
    return { success: true };
  }

  async getOfferings(): Promise<PurchasesOfferings> {
    return { current: null } as PurchasesOfferings;
  }

  async getCustomerInfo(): Promise<CustomerInfo> {
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

  async purchasePackage(): Promise<CustomerInfo> {
    return this.getCustomerInfo();
  }

  async restorePurchases(): Promise<CustomerInfo> {
    return this.getCustomerInfo();
  }
}

export const revenueCatService = RevenueCatService.getInstance();
EOL

# Clear caches
echo "Clearing development caches..."
watchman watch-del-all 2>/dev/null || true
rm -rf node_modules/.cache/expo/

# Start Expo
echo "Starting Expo development server..."
npx expo start --clear
