import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

export function Header() {
  return (
    <View style={styles.header}>
      <Image
        source={require('@/assets/images/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  logo: {
    width: 170,
    height: 48,
    marginTop: 8,
  },
}); 