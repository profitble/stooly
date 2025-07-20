import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import * as SplashScreen from 'expo-splash-screen';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { themeColors } from '@/styles/theme';

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
    void SplashScreen.hideAsync();
  }, []);

  // Handle subscription-related errors differently
  const isSubscriptionError = error.message.includes('subscription') || 
                            error.message.includes('entitlement') ||
                            error.message.includes('RevenueCat');

  return (
    <View style={styles.container}>
      <FontAwesome5 name="exclamation-circle" size={48} color={themeColors.primary} style={styles.icon} />
      <Text style={styles.title}>
        {isSubscriptionError ? 'Subscription Issue' : 'Something Went Wrong'}
      </Text>
      <Text style={styles.message}>
        {isSubscriptionError 
          ? 'Couldn\'t check your subscription. Try again.'
          : 'Please try again.'}
      </Text>
      <Pressable
        style={styles.button}
        onPress={async () => {
          clearMemory();
          resetErrorBoundary();
        }}
      >
        <Text style={styles.buttonText}>Try Again</Text>
      </Pressable>
    </View>
  );
}

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Reset app state here if needed
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    color: themeColors.primaryText,
    marginBottom: 16,
    fontFamily: 'SF-Pro',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: themeColors.secondaryText,
    marginBottom: 32,
    textAlign: 'center',
    fontFamily: 'SF-Pro',
  },
  button: {
    backgroundColor: themeColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 9999,
  },
  buttonText: {
    color: themeColors.fabIcon,
    fontSize: 16,
    fontFamily: 'SF-Pro',
  },
}); 