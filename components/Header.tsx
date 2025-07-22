import React from 'react';
import { View, Image } from 'react-native';

const V = View as any;
const Img = Image as any;

export function Header() {
  return (
    <V className="flex-row justify-between items-center px-4 py-3">
      <Img
        source={require('@/assets/images/logo.png')}
        resizeMode="contain"
        className="w-[170px] h-[48px] mt-2"
      />
    </V>
  );
} 