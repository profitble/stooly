import { Alert } from 'react-native';

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

const defaultErrorMessage = 'Something went wrong – try again.';

export function presentError(error: any): void {
  const errorMessage = error?.message || (typeof error === 'string' ? error : 'Unknown error');
  
  const friendlyMessage = errorMessages[errorMessage] || defaultErrorMessage;


  Alert.alert(
    'We Couldn\'t Check the Photo',
    friendlyMessage,
    [{ text: 'OK' }],
    { cancelable: true }
  );
}
