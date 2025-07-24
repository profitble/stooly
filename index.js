import 'expo-router/entry';
import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';
import React from 'react';

// Handle unhandled promise rejections
const originalHandler = global.onunhandledrejection;
global.onunhandledrejection = function(event) {
  console.warn('Unhandled Promise Rejection:', event.reason);
  event.preventDefault();
  
  if (originalHandler) {
    originalHandler.call(this, event);
  }
};

// Handle global errors via global ErrorHandler if available
if (global.ErrorUtils) {
  global.ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.warn('Global JS Exception:', error.message);
    if (isFatal) {
      console.error('Fatal error prevented:', error);
    }
  });
}

export function App() {
  const ctx = require.context('./app');
  return <ExpoRoot context={ctx} />;
}

registerRootComponent(App);
 