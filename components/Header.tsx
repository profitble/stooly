import React from 'react';
import { StyleSheet } from 'react-native';
import { Box, Image } from '@gluestack-ui/themed';

export function Header() {
  return (
    <Box style={styles.header}>
      <Image
        source={require('@/assets/images/logo.png')}
        style={styles.logo}
        resizeMode="contain"
        alt="Stooly Logo"
      />
    </Box>
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