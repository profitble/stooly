console.log('[FILE LOADED: ErrorBoundary.tsx]');
import React, { useEffect } from 'react';
console.log('[ERROR_BOUNDARY_IMPORT] React imported');
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
console.log('[ERROR_BOUNDARY_IMPORT] react-error-boundary imported');
import * as SplashScreen from 'expo-splash-screen';
console.log('[ERROR_BOUNDARY_IMPORT] expo-splash-screen imported');
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
console.log('[ERROR_BOUNDARY_IMPORT] FontAwesome5 imported');
import { View as RNView, Text as RNText, Pressable as RNPressable } from 'react-native';
console.log('[ERROR_BOUNDARY_IMPORT] React Native components imported');

const View = RNView as any;
const Text = RNText as any;
const Pressable = RNPressable as any;
const PRIMARY = '#111';
const SECONDARY = '#6d6d6d';
const BG = '#fdfdfd';
const FAB_COLOR = '#a26235';
console.log('[ERROR_BOUNDARY_CONSTANTS] Color constants defined');

function clearMemory() {
  console.log('[ERROR_BOUNDARY_MEMORY] clearMemory function called');
  // Force garbage collection through indirect means
  const array = new Array(100).fill('dummy');
  array.length = 0;
  console.log('[ERROR_BOUNDARY_MEMORY] Dummy array cleared');
  if (global.gc) {
    console.log('[ERROR_BOUNDARY_MEMORY] Calling global.gc()');
    global.gc();
  } else {
    console.log('[ERROR_BOUNDARY_MEMORY] global.gc not available');
  }
}

function ErrorFallback({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) {
  console.log('[ERROR_FALLBACK] ErrorFallback component rendered');
  console.log('[ERROR_FALLBACK] Error received:', error?.message);
  
  useEffect(() => {
    console.log('[ERROR_FALLBACK_EFFECT] useEffect called - hiding splash screen');
    void SplashScreen.hideAsync();
  }, []);

  console.log('[ERROR_FALLBACK] Checking if subscription error');
  const isSubscriptionError = error.message.includes('subscription') || 
                            error.message.includes('entitlement') ||
                            error.message.includes('RevenueCat');
  console.log('[ERROR_FALLBACK] Is subscription error:', isSubscriptionError);

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
        onPress={() => {
          console.log('[ERROR_FALLBACK] Reset button pressed');
          clearMemory();
          console.log('[ERROR_FALLBACK] Calling resetErrorBoundary');
          resetErrorBoundary();
        }}
      >
        <Text className="text-white font-medium text-base">
          Try Again
        </Text>
      </Pressable>
    </View>
  );
}

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  console.log('[ERROR_BOUNDARY] ErrorBoundary component rendered');
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        console.log('[ERROR_BOUNDARY] onReset callback called');
        // Reset app state here if needed
      }}
      onError={(error, errorInfo) => {
        console.error('[ERROR_BOUNDARY] Error caught by boundary:', error);
        console.error('[ERROR_BOUNDARY] Error info:', errorInfo);
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
} 