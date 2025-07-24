import React, { useEffect } from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import * as SplashScreen from 'expo-splash-screen';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { View as RNView, Text as RNText, Pressable as RNPressable } from 'react-native';

const View = RNView as any;
const Text = RNText as any;
const Pressable = RNPressable as any;
const PRIMARY = '#111';
const SECONDARY = '#6d6d6d';
const BG = '#fdfdfd';
const FAB_COLOR = '#a26235';

function clearMemory() {
  // Force garbage collection through indirect means
  const array = new Array(100).fill('dummy');
  array.length = 0;
  if (global.gc) {
    global.gc();
  }
}

function ErrorFallback({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) {
  useEffect(() => {
    try {
      void SplashScreen.hideAsync();
    } catch (e) {
      // Ignore splash screen errors
    }
  }, []);

  const isSubscriptionError = error.message.includes('subscription') || 
                            error.message.includes('entitlement') ||
                            error.message.includes('RevenueCat');

  const handleReset = () => {
    try {
      clearMemory();
      resetErrorBoundary();
    } catch (e) {
      // Force reload by throwing again after delay
      setTimeout(() => {
        throw new Error('Force reload');
      }, 100);
    }
  };

  return (
    <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: BG }}>
      <FontAwesome5 name="exclamation-circle" size={48} color="#a26235" style={{ marginBottom: 24 }} />
      <Text className="text-2xl font-bold text-center mb-4" style={{ color: PRIMARY }}>
        {isSubscriptionError ? 'Subscription Issue' : 'Something Went Wrong'}
      </Text>
      <Text className="text-base text-center mb-8" style={{ color: SECONDARY }}>
        {isSubscriptionError 
          ? "Couldn't check your subscription. Try again."
          : 'Please try again.'}
      </Text>
      <Pressable
        className="rounded-full px-6 py-3"
        style={{ backgroundColor: FAB_COLOR }}
        onPress={handleReset}
      >
        <Text className="text-white font-medium text-base">
          Try Again
        </Text>
      </Pressable>
    </View>
  );
}

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        try {
          // Log errors but don't crash the app
          console.warn('Error caught by boundary:', error.message);
          console.warn('Error info:', errorInfo);
        } catch (e) {
          // Ignore logging errors
        }
      }}
      onReset={() => {
        try {
          // Reset app state here if needed
          clearMemory();
        } catch (e) {
          // Ignore reset errors
        }
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}
