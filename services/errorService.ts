import { Alert } from 'react-native';

const errorMessages: { [key: string]: string } = {
  'Missing or invalid image (base64)': 
    'We couldn’t use the photo — please try taking it again.',

  'DeepSeek API failed': 
    'We couldn’t check the photo right now — please try again later.',

  'No content returned from DeepSeek':
    'We couldn’t get results — try a clearer photo.',

  'Could not extract valid JSON from response':
    'Something went wrong — please try again in a bit.',

  'No stool detected': 
    'We didn’t see a stool — please try again with a better angle.',

  'Image is too blurry':
    'The photo is too blurry — try taking a sharper one.',
};

const defaultErrorMessage = 'Something went wrong — please try again.';

export function presentError(error: any): void {
  const errorMessage = error?.message || (typeof error === 'string' ? error : 'Unknown error');
  const friendlyMessage = errorMessages[errorMessage] || defaultErrorMessage;

  Alert.alert(
    'We Couldn’t Check the Photo',
    friendlyMessage,
    [{ text: 'OK' }],
    { cancelable: true }
  );
}
