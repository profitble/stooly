const { hairlineWidth } = require('nativewind/theme');

module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  safelist: [
    'bg-black', 'bg-white', 'text-white',
    'bg-[#f4f1f4]', 'bg-[#E5E5E5]', 'bg-[#F0F0F0]', 'bg-[#fdfdfd]', 'bg-[#b2b2b4]',
    'bg-[#f3f4f6]', 'bg-[#f7f4f8]',
    'text-[#111]', 'text-[#6D6D6D]', 'text-[#d5d5d7]',
    'border-[#E5E7EB]/40',
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