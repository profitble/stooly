import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import * as SplashScreen from 'expo-splash-screen';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import {
  Box,
  Text,
  Button,
  ButtonText,
} from '@gluestack-ui/themed';
import { moderateScale } from '@/styles/sizing';

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

  const isSubscriptionError = error.message.includes('subscription') || 
                            error.message.includes('entitlement') ||
                            error.message.includes('RevenueCat');

  return (
    <Box
      flex={1}
      backgroundColor="$background"
      alignItems="center"
      justifyContent="center"
      padding={24}
    >
      <FontAwesome5 name="exclamation-circle" size={48} color="#a26235" style={{ marginBottom: 24 }} />
      <Text
        color="$primaryText"
        fontWeight="$bold"
        textAlign="center"
        marginBottom={16}
        sx={{ fontSize: moderateScale(24) }}
      >
        {isSubscriptionError ? 'Subscription Issue' : 'Something Went Wrong'}
      </Text>
      <Text
        color="$secondaryText"
        textAlign="center"
        marginBottom={32}
        sx={{ fontSize: moderateScale(16) }}
      >
        {isSubscriptionError 
          ? 'Couldn\'t check your subscription. Try again.'
          : 'Please try again.'}
      </Text>
      <Button
        backgroundColor="$primary"
        borderRadius={9999}
        paddingHorizontal={24}
        paddingVertical={12}
        onPress={() => {
          clearMemory();
          resetErrorBoundary();
        }}
      >
        <ButtonText color="$fabIcon" sx={{ fontSize: moderateScale(16) }}>
          Try Again
        </ButtonText>
      </Button>
    </Box>
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