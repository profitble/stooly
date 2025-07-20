import type { ExpoConfig } from 'expo/config';
import { z } from 'zod';

const configEnvSchema = z.object({
  EXPO_PUBLIC_API_BASE_URL: z.string().url().optional(),
  EXPO_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  EXPO_PUBLIC_REVENUECAT_API_KEY_IOS: z.string().min(1).optional(),
}).optional();

const env = configEnvSchema.parse(process.env);

const config: ExpoConfig = {
  name: "Stooly",
  slug: "stooly",
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
    bundleIdentifier: 'com.stooly.app',
    buildNumber: '1',
    config: {
      usesNonExemptEncryption: false,
    },
    infoPlist: {
      UIBackgroundModes: ["remote-notification", "fetch"],
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
    },
  },
  plugins: [
    "expo-router",
    "./plugins/withReactNativePurchases",
    [
      "expo-build-properties",
      {
        ios: {
          useFrameworks: "static",
          deploymentTarget: "15.1",
          hermesFlags: ["-O"],
        },
      }
    ]
  ],
  scheme: "stooly",
  platforms: ["ios"],
  web: {
    bundler: "metro"
  },
  experiments: {
    tsconfigPaths: true
  },
  extra: {
    router: {
      origin: false
    },
    eas: {
      projectId: "c3e6cfc6-a45b-4960-b596-221c2b69f093"
    },
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    revenueCatApiKeyIos: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS,
  },
  owner: "maxta"
};

export default config;
