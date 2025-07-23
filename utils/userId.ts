console.log('[FILE LOADED: userId.ts]');
import * as SecureStore from 'expo-secure-store';
console.log('[USERID_IMPORT] expo-secure-store imported');
import 'react-native-get-random-values';
console.log('[USERID_IMPORT] react-native-get-random-values imported');
import { v4 as uuidv4 } from 'uuid';
console.log('[USERID_IMPORT] uuid imported');

const APP_USER_ID_KEY = 'app_user_id';
console.log('[USERID_CONSTANT] APP_USER_ID_KEY set to:', APP_USER_ID_KEY);

export async function getOrCreateAppUserId(): Promise<string> {
  console.log('[USERID_FUNCTION] getOrCreateAppUserId called');
  try {
    console.log('[USERID_SECURE] Attempting to get user ID from SecureStore');
    let appUserId = await SecureStore.getItemAsync(APP_USER_ID_KEY);
    console.log('[USERID_SECURE] Existing user ID found:', !!appUserId);
    
    if (!appUserId) {
      console.log('[USERID_GENERATE] Generating new UUID');
      appUserId = uuidv4();
      console.log('[USERID_GENERATE] New UUID generated:', !!appUserId);
      
      console.log('[USERID_SECURE] Storing new user ID in SecureStore');
      await SecureStore.setItemAsync(APP_USER_ID_KEY, appUserId);
      console.log('[USERID_SECURE] User ID stored successfully');
    }
    
    console.log('[USERID_RETURN] Returning user ID:', !!appUserId);
    return appUserId;
  } catch (error) {
    console.error('[USERID_ERROR] SecureStore error:', error);
    console.log('[USERID_FALLBACK] Using fallback UUID generation');
    // Fallback to generated UUID if SecureStore fails
    const fallbackId = uuidv4();
    console.log('[USERID_FALLBACK] Fallback UUID generated:', !!fallbackId);
    return fallbackId;
  }
}