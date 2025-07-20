declare module 'expo-constants' {
  interface ExpoConfig {
    extra?: {
      EXPO_PUBLIC_API_BASE_URL?: string;
      EXPO_PUBLIC_SUPABASE_ANON_KEY?: string;
      EXPO_PUBLIC_REVENUECAT_API_KEY_IOS?: string;
    };
  }
} 