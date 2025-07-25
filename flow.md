                    Expo Router Authentication Flow Analysis
                           📱 Build #39 - Stooly App Implementation

Timeline & Flow - Build #39:
Time →   0 ms     500 ms    1000 ms   1500 ms   2000 ms
         |--------|---------|---------|---------|
Root Layout (_layout.tsx)
 [0 ms]   ● App starts + SplashScreen.preventAutoHideAsync()
 [0 ms]   ● RevenueCat initialization begins
 [0-500ms] ● Native splash screen visible during:
             • revenueCatService.initialize()
             • revenueCatService.isSubscribed() check
             • Asset preloading (cardImages array)
 [500 ms] ● Navigation decision made:
             • ✅ Paid: router.replace('/(protected)/home')
             • ❌ Unpaid: router.replace('/(public)/1-start')
 [500 ms] ● SplashScreen.hideAsync() called
 [500-1500ms] ● Custom fade overlay animation (1000ms duration)

Protected Layout (_layout.tsx) 
 [500 ms] ● Mounts only if user navigated to /(protected)/home
 [500 ms] ● useState('checking') → immediate useEffect validation
 [500 ms] ● Returns null during validation (no spinner shown)
 [600 ms] ● Subscription revalidation completes
 [600 ms] ● ✅ Valid: renders SafeAreaView + Header + Stack
           ● ❌ Invalid: router.replace('/(public)/1-start')

Home Screen (home.tsx)
 [600 ms] ● Mounts after protected layout validation passes
 [600 ms] ● useFocusEffect() runs normally
 [600 ms] ● All UI components render immediately

────────────────────────────────────────────────────────────────────────────────────────
AUTHENTICATION IMPLEMENTATION - Build #39:
 • **Root Navigation**: Initial subscription check and routing in app/_layout.tsx:60-66
 • **Splash Screen Control**: Native splash remains visible during initialization
 • **Guard Pattern**: subscriptionState !== 'valid' returns null (_layout.tsx:55)
 • **No Loading UI**: Removed ActivityIndicator - validation happens during splash
 • **Validation Flow**: Double-check pattern - root layout + protected layout validation
 • **Error Handling**: Catch blocks redirect to start screen (_layout.tsx:34)
 • **State Management**: isCancelled prevents race condition updates (_layout.tsx:24,32)
 • **Navigation Control**: BackHandler disables hardware back in protected areas (_layout.tsx:45)

COMPONENT LIFECYCLE - Build #39:
 Root Layout:
    SplashScreen.preventAutoHideAsync() → RevenueCat init → subscription check → navigation → SplashScreen.hideAsync() → fade overlay
 Protected Layout:  
    useState('checking') → useEffect() → render guard (line 55) → returns null or SafeAreaView
 Home Screen:  
    Mounts only after protected layout renders → useFocusEffect runs immediately

LOADING/SPLASH IMPLEMENTATION:
 • Native Splash: Controlled by expo-splash-screen, visible during initialization
 • Custom Overlay: Animated fade overlay in root layout with #180b0b background
 • Animation: 1000ms fade out after splash screen hides
 • No Spinner: Removed ActivityIndicator - all loading happens during splash
 • Duration: Splash visible for entire initialization (~500ms typical)

────────────────────────────────────────────────────────────────────────────────────────
VISUAL FLOW DIAGRAM:
```
    ┌─────────────────────────────────────────────────────┐
    │                  App Launch                         │
    └─────────────────┬───────────────────────────────────┘
                      │
                      ▼
    ┌─────────────────────────────────────────────────────┐
    │             Root Layout                             │
    │         (app/_layout.tsx)                           │
    │                                                     │
    │  SplashScreen.preventAutoHideAsync()                │
    │           │                                         │
    │           ▼                                         │
    │  RevenueCat Init + Subscription Check               │
    │           │                                         │
    │           ▼                                         │
    │     ┌─────────────┐                                │
    │     │ 🖼️ SPLASH   │ ◄─── User sees native splash    │
    │     │ SCREEN      │                                │
    │     │ #180b0b     │                                │
    │     └─────────────┘                                │
    └─────────────────┬───────────────────────────────────┘
                      │
         ┌────────────┴────────────┐
         │                         │
         ▼                         ▼
    ┌─────────────┐          ┌─────────────┐
    │ ✅ PAID     │          │ ❌ UNPAID   │
    │             │          │             │
    │ router      │          │ router      │
    │ .replace(   │          │ .replace(   │
    │ 'home')     │          │ '1-start')  │
    │      │      │          │      │      │
    │      ▼      │          │      ▼      │
    │ ┌─────────┐ │          │ ┌─────────┐ │
    │ │Protected│ │          │ │ Start   │ │
    │ │ Layout  │ │          │ │ Screen  │ │
    │ └─────────┘ │          │ └─────────┘ │
    │      │      │          └─────────────┘
    │      ▼      │
    │ ┌─────────┐ │
    │ │ Home    │ │
    │ │ Screen  │ │
    │ │ Renders │ │
    │ └─────────┘ │
    └─────────────┘
```

APPLICATION CONTEXT:
 • App: "Stooly" (Poop tracking app)
 • Bundle ID: com.maxta.poop  
 • Current Build: #39 (iOS buildNumber in app.config.ts)
 • Target: iOS 15.1+ with Hermes enabled
 • Architecture: Expo Router + RevenueCat subscriptions
 • Subscription Model: Paywall-protected premium features

DEVELOPMENT ITERATION:
Build #39 represents the latest implementation with improved splash screen handling.
The authentication flow now uses native splash screen for loading states instead of custom spinners.

**Root Layout (_layout.tsx) - App Initialization:**
- Prevents splash screen auto-hide with `SplashScreen.preventAutoHideAsync()`
- RevenueCat initialization and subscription check happen during splash screen
- Navigation decision made while native splash is visible:
  - Paid users: `router.replace('/(protected)/home')`
  - Unpaid users: `router.replace('/(public)/1-start')`
- Asset preloading happens serially to prevent crashes
- Custom fade overlay animation (1000ms) after splash screen hides

**Protected Layout (_layout.tsx) - Access Control:**
- Uses `useState<'checking' | 'valid' | 'invalid'>('checking')` for state management
- Async subscription validation with cache invalidation
- Returns `null` while checking or invalid (no loading spinner)
- AppState listener for subscription recheck on app resume
- Hardware back button disabled with `BackHandler`
- Invalid users redirected to `/(public)/1-start` (not paywall)

**Key Changes from Previous Builds:**
- Removed ActivityIndicator loading spinner from protected layout
- Navigation logic moved to root layout during splash screen
- Subscription check happens before any UI renders
- Unpaid users now go to start screen instead of paywall directly