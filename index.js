console.log('[BOOT] FILE LOADED: index.js');
import 'expo-router/entry';
import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';
import React from 'react';

export function App() {
  console.log('[BOOT] App function called - creating ExpoRoot');
  const ctx = require.context('./app');
  return <ExpoRoot context={ctx} />;
}

console.log('[BOOT] Registering root component...');
registerRootComponent(App);
console.log('[BOOT] Root component registered successfully'); 