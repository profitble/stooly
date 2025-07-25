# 🛠️ Expo Router Auth Flow — Build #40: Stooly App

### 📱 Context

* **App:** Stooly (poop tracking)
* **Platform:** iOS 15.1+
* **Arch:** Expo Router + RevenueCat
* **Build:** #40 (Bundle: `com.maxta.poop`)
* **Model:** Paid-only features via subscription

---

### ⚡ Timeline Overview

```
Time →   0 ms     500 ms    1000 ms   1500 ms   2000 ms
         |--------|---------|---------|---------|
Root Layout:
 [0 ms]     App starts → SplashScreen.preventAutoHideAsync()
 [0 ms]     RevenueCat.initialize() begins
 [0–500 ms] Native splash screen remains visible during:
             - RevenueCat init
             - Subscription check
             - Asset preloading (cardImages)
 [500 ms]   Routing decision made:
             - ✅ Paid → /home
             - ❌ Unpaid → /1-start
             - Then: SplashScreen.hideAsync()
 [500–1500 ms]  Custom 1000ms fade overlay animation

Protected Layout:
 [500 ms]   Mounted if routed to `/home`
            → useState('checking') + useEffect
 [600 ms]   Revalidates subscription:
             - ✅ Valid → renders app shell
             - ❌ Invalid → redirects to /1-start

Home Screen:
 [600 ms]   Mounted after validation
            → useFocusEffect + immediate UI render
```

---

### 🔐 Authentication Logic (Build #40)

* **Root Navigation:**

  * Initial routing handled in `app/_layout.tsx` before any UI mounts
* **Splash Control:**

  * Native splash stays up during initialization
  * Custom overlay fades out after routing decision
* **Guard Logic:**

  * Protected layout blocks rendering until subscription is `'valid'`
* **No Spinner:**

  * Removed `ActivityIndicator`; all validation happens behind splash
* **Double Validation:**

  * First in root layout, second in protected layout for redundancy
* **Error Handling:**

  * Catches redirect to `/1-start` on failure
* **Back Handling:**

  * Hardware back disabled in protected stack
* **Race Safety:**

  * Prevents state updates on unmounted component with cancel guard

---

### 🧬 Component Lifecycle Summary

**Root Layout:**

```
SplashScreen.preventAutoHideAsync()
→ RevenueCat init
→ Subscription check
→ router.replace(...)
→ SplashScreen.hideAsync()
→ Fade animation
```

**Protected Layout:**

```
useState('checking')
→ useEffect revalidates subscription
→ if valid: render SafeAreaView + Header + Stack
→ if invalid: redirect to /1-start
```

**Home Screen:**

```
Mounted only if subscription is valid
→ useFocusEffect runs immediately
→ All UI renders right away
```

---

### 🎨 Splash / Loading UX

| Feature             | Description                                 |
| ------------------- | ------------------------------------------- |
| **Native Splash**   | Managed via `expo-splash-screen`            |
| **Custom Overlay**  | #180b0b full-screen fade (1000ms) post-init |
| **Spinner Removed** | All loading hidden behind splash            |
| **Preload Timing**  | \~500ms typical from launch to fade start   |

---

### 🔁 Visual Flow Diagram

```
     App Launch
         │
         ▼
     Root Layout
         │
         ▼
 ┌───────────────┐
 │ Native Splash │
 └──────┬────────┘
        ▼
 RevenueCat Init + Subscription Check
        ▼
 ┌───────────────┐            ┌───────────────┐
 │ ✅ Paid       │            │ ❌ Unpaid     │
 │ /home         │            │ /1-start      │
 └─────┬─────────┘            └─────┬─────────┘
       ▼                              ▼
 Protected Layout                Onboarding Start
       │
       ▼
   Home Screen
```

---

### 🔄 Key Changes from Previous Builds

* ✅ Moved routing logic up to **Root Layout** — handled before UI mount
* ✅ **Removed spinner** in Protected Layout → replaced by native splash
* ✅ Users now land on `/1-start` (not paywall) if unpaid
* ✅ **Splash hides only after** all assets + validation complete
* ✅ Double-check pattern ensures no protected access leaks