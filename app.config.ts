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
    bundleIdentifier: "com.maxta.stooly",
    buildNumber: "3",
    infoPlist: {
      UIBackgroundModes: ["remote-notification", "fetch"],
      CFBundleAllowMixedLocalizations: true,
      ITSAppUsesNonExemptEncryption: false,
      SKPaymentTransactions: true,
      NSCameraUsageDescription: "We use the camera to let you take photos inside the app.",
      NSLocationWhenInUseUsageDescription: "This app may request location access to enable certain features.",
      NSUserNotificationUsageDescription: "This app may send you notifications to keep you informed.",
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
      "expo-build-properties",
      {
        ios: {
          deploymentTarget: "15.1",
          useFrameworks: "static",
          enableHermes: true,
          hermesFlags: ["-O", "-shrink-level=2"]
        },
        android: {
          enableHermes: true,
          hermesFlags: ["-O", "-shrink-level=2"]
        }
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
      projectId: "e24bd6e6-aac9-4740-ad43-643f93ab8e45"
    },
    REVENUECAT_API_KEY_IOS: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS,
  },
  owner: "maxta"
};

export default config;
