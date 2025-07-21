import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { headingLarge, bodyLarge, buttonText } from '@/styles/fonts';
import { horizontalScale, verticalScale, moderateScale } from '@/styles/sizing';

const SIDE_MARGIN = horizontalScale(26);
const BUTTON_HEIGHT = verticalScale(60);

export default function SigninScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleContinue = () => {
    router.push('/(public)/2-gender');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentWrapper}>
        <Image
          source={require('@/assets/images/cover.png')}
          style={styles.hero}
          resizeMode="contain"
        />
      </View>

      <View style={[styles.overlay, { paddingBottom: insets.bottom > 0 ? insets.bottom + 50 : 170 }]}>
        <View style={styles.textWrapper}>
          <Text style={styles.title}>
            Welcome to <Text style={styles.titleAccent}>Stooly</Text>
          </Text>
          <Text style={styles.subtitle}>
            Build Habits Towards Better Gut Health
          </Text>
        </View>

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
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIDE_MARGIN,
    paddingBottom: verticalScale(250), // Restores vertical positioning
  },
  hero: {
    width: '100%',
    height: '100%',
    maxWidth: 400,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f4f1f4',
    paddingHorizontal: SIDE_MARGIN,
    paddingTop: verticalScale(32),
    alignItems: 'center',
  },
  textWrapper: {
    marginBottom: verticalScale(32),
    width: '100%',
  },
  title: {
    fontSize: moderateScale(36),
    ...headingLarge,
    color: '#111',
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  titleAccent: {
    color: '#a6643c',
  },
  subtitle: {
    fontSize: moderateScale(18),
    ...bodyLarge,
    color: '#4B5563',
    marginTop: verticalScale(12),
    textAlign: 'center',
  },
  startBtn: {
    width: '100%',
    backgroundColor: '#010103',
    borderRadius: moderateScale(16),
    height: BUTTON_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startBtnText: {
    color: '#fff',
    fontSize: moderateScale(18),
    ...buttonText,
  },
}); 