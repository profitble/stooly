console.log('[FILE LOADED: _layout.tsx]');
import React, { useEffect, useRef } from 'react';
console.log('[LAYOUT_IMPORT] React imported');
import { Stack } from 'expo-router';
console.log('[LAYOUT_IMPORT] expo-router imported');
import { View } from 'react-native';
import { Animated } from 'react-native';
console.log('[LAYOUT_IMPORT] react-native components imported');
import { StatusBar } from 'expo-status-bar';
console.log('[LAYOUT_IMPORT] expo-status-bar imported');
import 'react-native-reanimated';
console.log('[LAYOUT_IMPORT] react-native-reanimated imported');
import * as SplashScreen from 'expo-splash-screen';
console.log('[LAYOUT_IMPORT] expo-splash-screen imported');
import { ErrorBoundary } from '../components/ErrorBoundary';
console.log('[LAYOUT_IMPORT] ErrorBoundary imported');
import { revenueCatService } from '../services/revenueCatService';
console.log('[LAYOUT_IMPORT] revenueCatService imported');
import { Asset } from 'expo-asset';
console.log('[LAYOUT_IMPORT] expo-asset imported');
import '../global.css';
console.log('[LAYOUT_IMPORT] global.css imported');

// Keep splash screen visible while loading fonts
console.log('[LAYOUT_SPLASH] Preventing auto hide of splash screen');
void SplashScreen.preventAutoHideAsync();
console.log('[LAYOUT_SPLASH] Splash screen prevention called');

// Array of images to preload
console.log('[LAYOUT_ASSETS] Defining card images for preload');
const cardImages = [
  require('@/assets/images/cover.png'),
  require('@/assets/images/icon.png'),
  require('@/assets/images/logo.png'),
  require('@/assets/images/poop.png'),
  require('@/assets/images/splash.png'),
  require('@/assets/images/type_1.png'),
  require('@/assets/images/type_2.png'),
  require('@/assets/images/type_3.png'),
  require('@/assets/images/type_4.png'),
  require('@/assets/images/type_5.png'),
  require('@/assets/images/type_6.png'),
  require('@/assets/images/type_7.png'),
];
console.log('[LAYOUT_ASSETS] Card images array created, count:', cardImages.length);

export default function RootLayout() {
  console.log('[LAYOUT_COMPONENT] RootLayout function called');
  const fadeAnim = useRef(new Animated.Value(1)).current;
  console.log('[LAYOUT_ANIM] Fade animation ref created');

  useEffect(() => {
    console.log('[LAYOUT_EFFECT] useEffect starting initialization');
    let isMounted = true;
    
    async function initializeApp() {
      console.log('[LAYOUT_INIT] initializeApp function called');
      try {
        console.log('[LAYOUT_INIT] Starting RevenueCat initialization');
        // Start RevenueCat initialization immediately
        const initResult = await revenueCatService.initialize();
        console.log('[LAYOUT_INIT] RevenueCat init result:', initResult.success);
        if (!initResult.success) {
          console.error('[LAYOUT_INIT] RevenueCat init failed:', initResult.error);
          throw initResult.error;
        }
        
        console.log('[LAYOUT_INIT] Starting asset preload');
        // Preload all card images
        await Promise.all(cardImages.map(image => Asset.loadAsync(image)));
        console.log('[LAYOUT_INIT] Asset preload complete');
        
        console.log('[LAYOUT_INIT] Hiding splash screen');
        // Hide native splash screen first
        await SplashScreen.hideAsync();
        console.log('[LAYOUT_INIT] Splash screen hidden');
        
        console.log('[LAYOUT_INIT] Starting fade animation');
        // Then start fade animation of our overlay
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }).start();
        console.log('[LAYOUT_INIT] Fade animation started');
      } catch (error) {
        console.error('[LAYOUT_INIT] Error during initialization:', error);
        // Still fade out smoothly on error
        console.log('[LAYOUT_INIT] Handling error gracefully, isMounted:', isMounted);
        if (isMounted) {
          console.log('[LAYOUT_INIT] Hiding splash screen after error');
          await SplashScreen.hideAsync();
          console.log('[LAYOUT_INIT] Starting error fade animation');
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }).start();
        }
      }
    }

    console.log('[LAYOUT_EFFECT] Calling initializeApp');
    void initializeApp();
    return () => { 
      console.log('[LAYOUT_EFFECT] Cleanup function called');
      isMounted = false;
    };
  }, []);

  console.log('[LAYOUT_RENDER] Rendering RootLayout component');
  return (
    <ErrorBoundary>
      <View style={{ flex: 1 }}>
        <StatusBar style="dark" />
        <Animated.View 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#180b0b',
            opacity: fadeAnim,
            zIndex: 999,
          }}
          pointerEvents="none"
        />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#180b0b' },
            animation: 'none',
          }}
        />
      </View>
    </ErrorBoundary>
  );
}
