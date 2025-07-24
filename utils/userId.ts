import * as SecureStore from 'expo-secure-store';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

const APP_USER_ID_KEY = 'app_user_id';

export async function getOrCreateAppUserId(): Promise<string> {
  try {
    let appUserId = await SecureStore.getItemAsync(APP_USER_ID_KEY);
    
    if (!appUserId) {
      appUserId = uuidv4();
      
      // Validate UUID before storing
      if (!appUserId || appUserId.length < 10) {
        throw new Error('Invalid UUID generated');
      }
      
      await SecureStore.setItemAsync(APP_USER_ID_KEY, appUserId);
    }
    
    // Validate stored UUID
    if (!appUserId || appUserId.length < 10) {
      throw new Error('Invalid stored UUID');
    }
    
    return appUserId;
  } catch (error) {
    console.warn('UUID generation/storage failed:', error);
    
    // Generate multiple fallback attempts
    for (let i = 0; i < 3; i++) {
      try {
        const fallbackId = uuidv4();
        if (fallbackId && fallbackId.length > 10) {
          console.warn('Using fallback UUID:', fallbackId);
          return fallbackId;
        }
      } catch (e) {
        console.warn(`Fallback UUID attempt ${i + 1} failed:`, e);
      }
    }
    
    // Final fallback with timestamp
    const timestampId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.warn('Using timestamp fallback ID:', timestampId);
    return timestampId;
  }
}