const { hairlineWidth } = require('nativewind/theme');

module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#a26235',
        primaryText: '#111',
        secondaryText: '#6b7280',
        background: '#fdfdfd',
        cardBackground: '#fff',
      },
      fontWeight: {
        regular: '400',
        medium: '500',
        bold: '700',
      },
      fontSize: {
        '2xs': '10px',
        'xs': '12px',
        'sm': '14px',
      },
      spacing: {
        '3xs': '2px',
        '2xs': '4px',
        'xs': '6px',
        'sm': '8px',
      },
      borderWidth: {
        hairline: hairlineWidth(),
      }
    },
  },
  plugins: [],
} 