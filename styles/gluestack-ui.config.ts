import { createConfig, createComponents } from '@gluestack-style/react';
import type { UIConfig } from '@gluestack-ui/themed';

// Create a new config object by extending the default config
export const config: UIConfig = createConfig({
  tokens: {
    colors: {
      // From theme.ts
      primary: '#a26235',
      secondaryText: '#6b7280',
      primaryText: '#111',
      background: '#fdfdfd',
      cardBackground: '#fff',
      ringBackground: '#e5e7eb',
      ringInactive: '#d1d5db',
      iconRed: '#ef4444',
      iconOrange: '#f97316',
      iconBlue: '#3b82f6',
      fabIcon: '#ffffff',
      navBorder: '#e5e7eb',
      inactiveNavText: '#9ca3af',
      emptyCardBackground: '#f9f8fd',
      gradientStart: '#f9fafb',
      gradientEnd: '#f3f4f6',

      // From initial gluestack.md
      text: '#684330',
      button: '#684330',
      buttonText: '#FFFFFF',
      primary0: '#684330',
      primary400: '#684330',
      primary500: '#684330',
      primary900: '#684330',
      bubbleDeepen: '#ffe4cf',
      bubbleFeel: '#d9eafc',
      bubbleLearn: '#fcd2d3',
    },
    space: {
      '3xs': 2,
      '2xs': 4,
      xs: 6,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 24,
      '2xl': 32,
      '3xl': 48,
      '4xl': 64,
    },
    fontWeights: {
      // From fonts.ts
      regular: '400',
      medium: '500',
      bold: '700',
    },
    fontSizes: {
      '2xs': 10,
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
      '5xl': 48,
      '6xl': 60,
    },
  },
  aliases: {
    bg: 'backgroundColor',
    h: 'height',
    w: 'width',
    p: 'padding',
    px: 'paddingHorizontal',
    py: 'paddingVertical',
    m: 'margin',
    mx: 'marginHorizontal',
    my: 'marginVertical',
  },
});

// Get the component config
export const components = createComponents(config); 