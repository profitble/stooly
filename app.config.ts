import type { ExpoConfig } from 'expo/config';

const revenueCatApiKeyIos = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS || '';

const config: ExpoConfig = {
  name: "Stooly",
  slug: "poop",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/images/splash.png",
    resizeMode: "contain",
    backgroundColor: "#fdfdfd"
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.maxta.poop",
    buildNumber: "33",
    infoPlist: {
      CFBundleAllowMixedLocalizations: true,
      ITSAppUsesNonExemptEncryption: false,
      SKPaymentTransactions: true,
      NSCameraUsageDescription: "We use the camera to let you take photos inside the app.",
      UIRequiresFullScreen: false,
      UISupportedInterfaceOrientations: [
        "UIInterfaceOrientationPortrait",
        "UIInterfaceOrientationPortraitUpsideDown"
      ],
      "UISupportedInterfaceOrientations~ipad": [
        "UIInterfaceOrientationPortrait",
        "UIInterfaceOrientationPortraitUpsideDown"
      ]
    }
  },
  plugins: [
    "expo-router",
    "./plugins/withReactNativePurchases",
    [
      "@sentry/react-native/expo",
      {
        organization: "stooly",
        project: "react-native"
      }
    ],
    [
      "expo-build-properties",
      {
        ios: {
          deploymentTarget: "15.1",
          useFrameworks: "static",
          enableHermes: true,
          newArchEnabled: false,
          hermesFlags: ["-O", "-shrink-level=2"]
        }
      }
    ]
  ],
  scheme: "poop",
  platforms: ["ios"],
  extra: {
    eas: { projectId: "9fbde21a-d8f9-4afe-bb34-c7d05e7690ce" },
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || '',
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
    revenueCatApiKeyIos
  },
  owner: "maxta"
};

export default config;