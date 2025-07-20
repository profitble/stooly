import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_DATA_KEYS = [
  'last_poop_timestamp',
  'poop_logs',
  'current_goals',
  'deleted_goals_queue',
];

export async function clearAllUserData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove(USER_DATA_KEYS);
  } catch (error) {
    console.error('Failed to clear user data:', error);
    throw new Error('Failed to clear user data.');
  }
}