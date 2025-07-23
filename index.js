console.log('[FILE LOADED: index.js]');
import 'expo-router/entry';
console.log('[INDEX_IMPORT] expo-router/entry imported');
import { registerRootComponent } from 'expo';
console.log('[INDEX_IMPORT] registerRootComponent imported');
import { ExpoRoot } from 'expo-router';
console.log('[INDEX_IMPORT] ExpoRoot imported');
import React from 'react';
console.log('[INDEX_IMPORT] React imported');

export function App() {
  console.log('[INDEX_APP] App function called');
  console.log('[INDEX_CONTEXT] Creating require context');
  const ctx = require.context('./app');
  console.log('[INDEX_CONTEXT] Context created:', !!ctx);
  console.log('[INDEX_RENDER] Returning ExpoRoot component');
  return <ExpoRoot context={ctx} />;
}

console.log('[INDEX_REGISTER] Registering root component');
registerRootComponent(App);
console.log('[INDEX_REGISTER] Root component registered'); 