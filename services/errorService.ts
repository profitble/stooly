console.log('[FILE LOADED: errorService.ts]');
import { Alert } from 'react-native';
console.log('[ERROR_IMPORT] Alert imported from react-native');

const errorMessages: { [key: string]: string } = {
  'Missing or invalid image (base64)': 
    'Couldn\'t use the photo – try taking it again.',

  'DeepSeek API failed': 
    'Can\'t check the photo right now – try again later.',

  'No content returned from DeepSeek':
    'Didn\'t get results – try a clearer photo.',

  'Could not extract valid JSON from response':
    'Something went wrong – try again in a bit.',

  'No stool detected': 
    'No stool detected – try another angle.',

  'Image is too blurry':
    'Photo is blurry – take a sharper one.',
};
console.log('[ERROR_MESSAGES] Error messages dictionary loaded, keys:', Object.keys(errorMessages).length);

const defaultErrorMessage = 'Something went wrong – try again.';
console.log('[ERROR_DEFAULT] Default error message set');

export function presentError(error: any): void {
  console.log('[ERROR_PRESENT] presentError called with:', typeof error);
  console.log('[ERROR_PRESENT] Error value:', error);
  
  const errorMessage = error?.message || (typeof error === 'string' ? error : 'Unknown error');
  console.log('[ERROR_PRESENT] Extracted error message:', errorMessage);
  
  const friendlyMessage = errorMessages[errorMessage] || defaultErrorMessage;
  console.log('[ERROR_PRESENT] Friendly message selected:', friendlyMessage);
  console.log('[ERROR_PRESENT] Using default message:', friendlyMessage === defaultErrorMessage);

  console.log('[ERROR_ALERT] Calling Alert.alert');
  Alert.alert(
    'We Couldn\'t Check the Photo',
    friendlyMessage,
    [{ text: 'OK' }],
    { cancelable: true }
  );
  console.log('[ERROR_ALERT] Alert.alert called successfully');
}
