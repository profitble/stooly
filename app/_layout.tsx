import React, { useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';
import { Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { revenueCatService } from '../services/revenueCatService';
import { Asset } from 'expo-asset';

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
  const [fontsLoaded] = useFonts({
    'SF-Pro': require('../assets/fonts/SF-Pro.ttf'),
  });

  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let isMounted = true;
    
    async function initializeApp() {
      try {
        // Start RevenueCat initialization immediately
        const initResult = await revenueCatService.initialize();
        if (!initResult.success) {
          throw initResult.error;
        }
        
        // Start font loading check
        if (!fontsLoaded || !isMounted) return;

        // Preload all card images
        await Promise.all(cardImages.map(image => Asset.loadAsync(image)));
        
        // Hide native splash screen first
        await SplashScreen.hideAsync();
        
        // Then start fade animation of our overlay
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }).start();
      } catch (error) {
        console.error('Failed to initialize:', error);
        // Still fade out smoothly on error
        if (fontsLoaded && isMounted) {
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
      isMounted = false;
    };
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <GluestackUIProvider config={config}>
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
      </GluestackUIProvider>
    </ErrorBoundary>
  );
}
