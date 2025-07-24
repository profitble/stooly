import React, { useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import { View } from 'react-native';
import { Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { revenueCatService } from '../services/revenueCatService';
import { Asset } from 'expo-asset';
import 'react-native-reanimated';
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
    let isMounted = true;
    
    async function initializeApp() {
      try {
        // Try RevenueCat initialization but don't throw on failure
        try {
          const initResult = await revenueCatService.initialize();
          if (!initResult.success) {
            console.warn('RevenueCat initialization failed:', initResult.error?.message);
          }
        } catch (rcError) {
          console.warn('RevenueCat failed to initialize:', rcError);
        }
        
        // Serialize asset loading to prevent concurrent crashes
        for (const image of cardImages) {
          try {
            await Asset.loadAsync(image);
          } catch (error) {
            console.warn('Failed to load asset:', error);
          }
        }
        
        // Hide native splash screen first
        await SplashScreen.hideAsync();
        
        // Then start fade animation of our overlay
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }).start();
      } catch (error) {
        // Still fade out smoothly on error
        if (isMounted) {
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
