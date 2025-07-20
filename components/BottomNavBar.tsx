import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Octicons from '@expo/vector-icons/Octicons';
import Entypo from '@expo/vector-icons/Entypo';
import { GearSix } from 'phosphor-react-native';
import { themeColors } from '../styles/theme';

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
    <View style={[styles.bottomNav, { paddingBottom: 16 + 8 }]}>
      {navItems.map((item, index) => {
        const Icon = item.icon;
        const isActive = activeScreen === item.name;
        return (
          <TouchableOpacity
            key={index}
            style={styles.navItem}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={() => router.push(`/(protected)/${item.name}` as any)}
          >
            {item.name === 'settings' ? (
              <Icon
                size={26}
                color={isActive ? themeColors.primaryText : themeColors.inactiveNavText}
              />
            ) : (
              <Icon
                name={item.iconName as any}
                size={26}
                color={isActive ? themeColors.primaryText : themeColors.inactiveNavText}
              />
            )}
            <Text style={isActive ? styles.navLabelActive : styles.navLabel}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingRight: 88,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: themeColors.navBorder,
    backgroundColor: themeColors.cardBackground,
  },
  navItem: {
    alignItems: 'center',
    marginHorizontal: 26,
  },
  navLabel: {
    fontSize: 12,
    color: themeColors.inactiveNavText,
    marginTop: 4,
    fontFamily: 'SFProDisplay-Regular',
  },
  navLabelActive: {
    fontSize: 12,
    color: themeColors.primaryText,
    marginTop: 4,
    fontFamily: 'SFProDisplay-Regular',
  },
}); 