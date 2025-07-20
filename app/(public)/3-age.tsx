/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import OnboardingProgress from '@/components/OnboardingProgress';

const SIDE_MARGIN = 26;
const BUTTON_HEIGHT = 60;

const ageRanges = [
  { value: '13-19', title: '13-19', desc: 'Puberty' },
  { value: '20-35', title: '20-35', desc: 'Lifestyle driven' },
  { value: '36-50', title: '36-50', desc: 'Hormonal shifts' },
];

export default function AgeRangeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [ageRange, setAgeRange] = useState<string | null>(null);

  // Screen is intentionally left blank other than the default header/footer.

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with back arrow and progress */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={[
            styles.backBtn,
            {
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: '#E5E5E5',
              justifyContent: 'center',
              alignItems: 'center',
            },
          ]}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={20} strokeWidth={1.5} color="#111" />
        </TouchableOpacity>
        <View
          style={[
            styles.progressBarBg,
            {
              height: 5,
              borderRadius: 9999,
              backgroundColor: '#F0F0F0',
              overflow: 'hidden',
            },
          ]}
        >
          <OnboardingProgress step={3} />
        </View>
      </View>

      <View style={{ paddingHorizontal: SIDE_MARGIN }}>
        <Text style={styles.title}>How old are you?</Text>
        <Text style={styles.subtitle}>This will be used to calibrate your{"\n"}custom plan.</Text>
      </View>

      {/* Gender selection buttons */}
      <View style={styles.genderContainer}>
        {ageRanges.map((item) => {
          const selected = ageRange === item.value;
          return (
            <TouchableOpacity
              key={item.value}
              style={[
                styles.genderBtn,
                {
                  backgroundColor: selected ? '#010103' : '#FFFFFF',
                },
              ]}
              onPress={() => setAgeRange(item.value)}
              accessibilityRole="button"
              accessibilityLabel={item.title}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={[styles.genderText, { color: selected ? '#fff' : '#111' }]}>{item.title}</Text>
              <Text style={[styles.optionDesc, { color: selected ? '#e5e7eb' : '#6b7280' }]}>{item.desc}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Hairline separator outside footer */}
      <View style={[styles.footerHairline, { position: 'absolute', bottom: BUTTON_HEIGHT + 8 + 20 + insets.bottom, left: 0, right: 0 }]} />

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 8, paddingTop: 20 }]}>
        <TouchableOpacity
          disabled={!ageRange}
          style={[styles.nextBtn, { backgroundColor: ageRange ? '#010103' : '#b2b2b4', height: BUTTON_HEIGHT, borderRadius: BUTTON_HEIGHT / 2 }]}
          onPress={() => router.push('/(public)/4-size')}
          accessibilityRole="button"
          accessibilityLabel="Next"
        >
          <Text style={styles.nextText}>Next</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f1f4' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIDE_MARGIN,
    marginBottom: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ede9f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  progressBarBg: { flex: 1, height: 2, backgroundColor: '#E7E7E7', borderRadius: 1, overflow: 'hidden' },
  progressBarFill: { width: '20%', height: '100%', backgroundColor: '#111' },
  title: { fontSize: 36, fontWeight: '700', letterSpacing: -0.2, color: '#111', marginBottom: 12, fontFamily: 'SFProDisplay-Bold' },
  subtitle: { fontSize: 18, color: '#111', marginBottom: 24 },
  starsWrapper: {
    borderWidth: 2,
    borderColor: '#ececec',
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 46,
  },
  starEmoji: { fontSize: 36, marginHorizontal: 6 },
  tagline: { fontSize: 20, fontWeight: '600', color: '#111', textAlign: 'center', marginBottom: 24 },
  avatarsRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 16, marginTop: 8 },
  avatar: { width: 52, height: 52, borderRadius: 26, borderWidth: 2, borderColor: '#fff' },
  usersText: { fontSize: 14, fontWeight: '500', color: '#6D6D6D', textAlign: 'center', marginBottom: 32 },
  card: {
    backgroundColor: '#8F8C94',
    borderRadius: 24,
    padding: 20,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardAvatar: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: '#fff' },
  cardName: { fontSize: 16, fontWeight: '600', color: '#fff' },
  cardText: { fontSize: 16, color: '#fff', lineHeight: 24 },
  cardStar: { fontSize: 14, marginRight: 2 },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fdfdfd',
    paddingHorizontal: SIDE_MARGIN,
    alignItems: 'center',
  },
  footerHairline: { width: '100%', height: StyleSheet.hairlineWidth + 1, backgroundColor: 'rgba(229,231,235,0.4)' },
  nextBtn: {
    width: '100%',
    borderRadius: BUTTON_HEIGHT / 2,
    height: BUTTON_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  nextText: { fontSize: 18, fontFamily: 'SFProDisplay-Medium', color: '#fff', fontWeight: '600' },
  genderContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    width: '100%',
    paddingHorizontal: SIDE_MARGIN,
    marginTop: 60,
  },
  genderBtn: {
    width: '100%',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 22,
  },
  genderText: { fontSize: 18, fontFamily: 'SFProDisplay-Medium', fontWeight: '600' },
  optionDesc: { fontSize: 16, fontFamily: 'SFProDisplay-Medium', marginTop: 4, fontWeight: '600' },
});