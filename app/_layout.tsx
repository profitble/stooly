import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { View } from 'react-native';
import { Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { revenueCatService } from '../services/revenueCatService';
import { Asset } from 'expo-asset';
import * as Sentry from '@sentry/react-native';
import 'react-native-reanimated';
import '../global.css';

void SplashScreen.preventAutoHideAsync();

Sentry.init({
  dsn: 'https://16f4bb8d3cb24372d4412446665085e0@o4509722657816576.ingest.us.sentry.io/4509722658603008',
});

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
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [showOverlay, setShowOverlay] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await revenueCatService.initialize();
        const paid = await revenueCatService.isSubscribed();
        router.replace(paid ? '/(protected)/home' : '/(public)/1-start');

        for (const image of cardImages) {
          await Asset.loadAsync(image);
        }

        await SplashScreen.hideAsync();
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }).start(() => {
          setShowOverlay(false); // ✅ Hide overlay completely
        });
      } catch {
        await SplashScreen.hideAsync();
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }).start(() => {
          setShowOverlay(false); // ✅ Hide on error too
        });
      }
    };

    void initializeApp();
  }, [fadeAnim, router]);

  return (
    <ErrorBoundary>
      <View style={{ flex: 1 }}>
        <StatusBar style="dark" />
        {showOverlay && (
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
        )}
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
