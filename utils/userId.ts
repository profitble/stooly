console.log('[BOOT] FILE LOADED: utils/userId.ts');
import * as SecureStore from 'expo-secure-store';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

const APP_USER_ID_KEY = 'app_user_id';

export async function getOrCreateAppUserId(): Promise<string> {
  console.log('[USER_ID] Getting or creating app user ID...');
  
  try {
    console.log('[USER_ID] Attempting to retrieve from SecureStore...');
    let appUserId = await SecureStore.getItemAsync(APP_USER_ID_KEY);
    
    if (!appUserId) {
      console.log('[USER_ID] No existing ID found, generating new UUID...');
      appUserId = uuidv4();
      console.log('[USER_ID] Generated ID:', `${appUserId.substring(0, 8)}...`);
      
      console.log('[USER_ID] Storing in SecureStore...');
      await SecureStore.setItemAsync(APP_USER_ID_KEY, appUserId);
      console.log('[USER_ID] Successfully stored in SecureStore');
    } else {
      console.log('[USER_ID] Retrieved existing ID:', `${appUserId.substring(0, 8)}...`);
    }
    
    return appUserId;
  } catch (error) {
    console.log('[USER_ID] [ERROR] SecureStore failed:', error instanceof Error ? error.message : String(error));
    console.log('[USER_ID] [ERROR] Stack:', error instanceof Error ? error.stack || 'No stack' : 'No stack');
    
    // Fallback to generated UUID if SecureStore fails
    const fallbackId = uuidv4();
    console.log('[USER_ID] Using fallback UUID:', `${fallbackId.substring(0, 8)}...`);
    return fallbackId;
  }
}