import React from 'react';
import { View as RNView, TouchableOpacity as RNTouchableOpacity, Text as RNText } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Octicons from '@expo/vector-icons/Octicons';
import Entypo from '@expo/vector-icons/Entypo';
import { GearSix } from 'phosphor-react-native';

// NativeWind aliasing
const V = RNView as any;
const TO = RNTouchableOpacity as any;
const T = RNText as any;

// color constants
const ACTIVE_COLOR = '#111';
const INACTIVE_COLOR = '#9ca3af';
const NAV_BG = '#fdfdfd';
const NAV_BORDER = '#E5E7EB';

interface BottomNavBarProps {
  activeScreen: 'home' | 'goals' | 'settings';
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeScreen }) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const navItems = [
    { name: 'home', label: 'Home', icon: Octicons, iconName: 'home' },
    { name: 'goals', label: 'Goals', icon: Entypo, iconName: 'bar-graph' },
    { name: 'settings', label: 'Settings', icon: GearSix, iconName: 'gear-six' },
  ];

  return (
    <V
      className="absolute left-0 right-0 bottom-0 flex-row justify-center border-t"
      style={{
        paddingTop: 0,
        paddingBottom: insets.bottom,
        paddingRight: 88,
        backgroundColor: NAV_BG,
        borderTopColor: NAV_BORDER,
        borderTopWidth: 1,
      }}
    >
      {navItems.map((item, index) => {
        const Icon = item.icon;
        const isActive = activeScreen === item.name;
        return (
          <TO
            key={index}
            className="items-center mx-[26px] translate-y-3"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={() => router.push(`/(protected)/${item.name}` as any)}
          >
            {item.name === 'settings' ? (
              <Icon
                size={26}
                color={isActive ? ACTIVE_COLOR : INACTIVE_COLOR}
              />
            ) : (
              <Icon
                name={item.iconName as any}
                size={26}
                color={isActive ? ACTIVE_COLOR : INACTIVE_COLOR}
              />
            )}
            <T className={`${isActive ? 'text-[#111]' : 'text-gray-400'} text-xs mt-1 font-medium`}>
              {item.label}
            </T>
          </TO>
        );
      })}
    </V>
  );
}; 