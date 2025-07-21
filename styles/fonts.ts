import { TextStyle } from 'react-native';

const fontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  bold: '700' as const,
};

export const headingLarge: TextStyle = {
  fontWeight: fontWeights.bold,
};

export const headingMedium: TextStyle = {
  fontWeight: fontWeights.medium,
};

export const bodyLarge: TextStyle = {
  fontWeight: fontWeights.regular,
};

export const bodyMedium: TextStyle = {
  fontWeight: fontWeights.regular,
};

export const bodyMediumBold: TextStyle = {
  fontWeight: fontWeights.bold,
};

export const bodySmall: TextStyle = {
  fontWeight: fontWeights.medium,
};

export const buttonText: TextStyle = {
  fontWeight: fontWeights.medium,
};
