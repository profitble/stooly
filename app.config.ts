import type { ExpoConfig } from 'expo/config';

const revenueCatApiKeyIos = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS;

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
    bundleIdentifier: 'com.maxta.poop',
    buildNumber: '7',
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
  scheme: "poop",
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
      projectId: "9fbde21a-d8f9-4afe-bb34-c7d05e7690ce"
    },
    gluestackUIConfigPath: "./styles/gluestack-ui.config.ts",
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    revenueCatApiKeyIos,
  },
  owner: "maxta"
};

export default config;
