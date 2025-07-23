console.log('[BOOT] FILE LOADED: app/_layout.tsx');
import React, { useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import { View } from 'react-native';
import { Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { revenueCatService } from '../services/revenueCatService';
import { Asset } from 'expo-asset';
import '../global.css';

// Keep splash screen visible while loading fonts
void SplashScreen.preventAutoHideAsync();

// Array of images to preload
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

export default function RootLayout() {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    console.log('[REACT] App mounted - RootLayout useEffect triggered');
    let isMounted = true;
    
    async function initializeApp() {
      console.log('[REACT] Starting app initialization...');
      
      try {
        // Start RevenueCat initialization immediately
        console.log('[REACT] Starting RevenueCat initialization...');
        const initResult = await revenueCatService.initialize();
        if (!initResult.success) {
          console.log('[REACT] [ERROR] RevenueCat initialization failed');
          throw initResult.error;
        }
        console.log('[REACT] RevenueCat initialization completed');
        
        // Preload all card images
        console.log('[REACT] Starting image preload...');
        await Promise.all(cardImages.map(image => Asset.loadAsync(image)));
        console.log('[REACT] Image preload completed');
        
        // Hide native splash screen first
        console.log('[REACT] Hiding splash screen...');
        await SplashScreen.hideAsync();
        console.log('[REACT] Splash screen hidden');
        
        // Then start fade animation of our overlay
        console.log('[REACT] Starting fade animation...');
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }).start();
        console.log('[REACT] App initialization completed successfully');
      } catch (error) {
        console.log('[REACT] [ERROR] App initialization failed:', error instanceof Error ? error.message : String(error));
        console.log('[REACT] [ERROR] Stack:', error instanceof Error ? error.stack || 'No stack' : 'No stack');
        
        // Still fade out smoothly on error
        if (isMounted) {
          console.log('[REACT] Performing error recovery - hiding splash and fading...');
          await SplashScreen.hideAsync();
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }).start();
        }
      }
    }

    void initializeApp();
    return () => { 
      console.log('[REACT] RootLayout cleanup - component unmounting');
      isMounted = false;
    };
  }, []);

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
