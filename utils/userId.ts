import * as SecureStore from 'expo-secure-store';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

const APP_USER_ID_KEY = 'app_user_id';

export async function getOrCreateAppUserId(): Promise<string> {
  try {
    let appUserId = await SecureStore.getItemAsync(APP_USER_ID_KEY);
    
    if (!appUserId) {
      appUserId = uuidv4();
      
      await SecureStore.setItemAsync(APP_USER_ID_KEY, appUserId);
    }
    
    return appUserId;
  } catch (error) {
    // Fallback to generated UUID if SecureStore fails
    const fallbackId = uuidv4();
    return fallbackId;
  }
}