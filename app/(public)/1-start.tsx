/* eslint-disable @typescript-eslint/no-explicit-any */
// Sign-in welcome screen – "Welcome to Balloon" with Apple & Email buttons

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { headingLarge, bodyLarge, buttonText } from '@/styles/fonts';

const SIDE_MARGIN = 26;
const BUTTON_HEIGHT = 60;

export default function SigninScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleContinue = () => {
    router.push('/(public)/2-gender');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentWrapper}>
        {/* Logo / hero illustration */}
        <View style={styles.heroWrapper}>
          <Image
            source={require('@/assets/images/cover.png')}
            style={styles.hero}
          />
        </View>

        {/* Title & subtitle */}
        <View style={styles.textWrapper}>
          <Text style={styles.title}>
            Welcome to <Text style={styles.titleAccent}>Stooly</Text>
          </Text>
          <Text style={styles.subtitle}>Build Habits Towards Better Gut Health</Text>
        </View>
      </View>

      <View style={[styles.footerWrapper, { paddingBottom: insets.bottom > 0 ? insets.bottom : 24 }]}>
        <TouchableOpacity
          style={styles.startBtn}
          onPress={handleContinue}
          accessibilityRole="button"
          accessibilityLabel="Start"
        >
          <Text style={styles.startBtnText}>Start</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f1f4',
    justifyContent: 'space-between',
  },
  contentWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
  },
  heroWrapper: {
    marginTop: 60,
    marginBottom: 36,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: SIDE_MARGIN,
  },
  hero: {
    width: '100%',
    height: 450,
    maxWidth: 400,
    resizeMode: 'contain',
  },
  textWrapper: {
    paddingHorizontal: SIDE_MARGIN,
    marginBottom: 32,
    width: '100%',
  },
  title: {
    fontSize: 36,
    ...headingLarge,
    color: '#111',
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  titleAccent: {
    color: '#a6643c',
  },
  subtitle: {
    fontSize: 18,
    ...bodyLarge,
    color: '#4B5563',
    marginTop: 12,
    textAlign: 'center',
  },
  startBtn: {
    width: '100%',
    backgroundColor: '#010103',
    borderRadius: 16,
    height: BUTTON_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startBtnText: {
    color: '#fff',
    fontSize: 18,
    ...buttonText,
  },
  footerWrapper: {
    width: '100%',
    paddingHorizontal: SIDE_MARGIN,
    marginBottom: 20,
  },
}); 