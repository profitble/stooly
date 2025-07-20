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
import Octicons from '@expo/vector-icons/Octicons';
import { CirclesThree, DotsSixVertical } from 'phosphor-react-native';

const SIDE_MARGIN = 26;
const BUTTON_HEIGHT = 60;

export default function ReviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [waterIntake, setWaterIntake] = useState<string | null>(null);

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
          <OnboardingProgress step={5} />
        </View>
      </View>

      <View style={{ paddingHorizontal: SIDE_MARGIN }}>
        <Text style={styles.title}>How many cups of water{"\n"}do you drink per day?</Text>
        <Text style={styles.subtitle}>This will be used to calibrate your{"\n"}custom plan.</Text>
      </View>

      {/* Workout selection cards */}
      <View style={styles.optionContainer}>
        {[
          {
            value: '1-4',
            title: '1 – 4 Cups',
            desc: 'Getting started',
            icon: () => <Octicons name="dot-fill" size={24} color="#111" />,
          },
          {
            value: '5-8',
            title: '5 – 8 Cups',
            desc: 'A healthy average',
            icon: () => <CirclesThree size={24} weight="fill" color="#111" />,
          },
          {
            value: '9+',
            title: '9+ Cups',
            desc: 'Hydration expert',
            icon: () => <DotsSixVertical size={36} color="#111" />,
          },
        ].map((opt, idx) => {
          const selected = waterIntake === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.optionCard,
                { backgroundColor: selected ? '#010103' : '#ffffff' },
              ]}
              onPress={() => setWaterIntake(opt.value)}
              accessibilityRole="button"
              accessibilityLabel={opt.value}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View style={styles.optionRow}>
                <View style={styles.optionIconWrap}>{opt.icon()}</View>
                <View style={{ marginLeft: 14 }}>
                  <Text style={[styles.optionTitle, { color: selected ? '#fff' : '#111' }]}>{opt.title}</Text>
                  <Text style={[styles.optionDesc, { color: selected ? '#e5e7eb' : '#6b7280' }]}>{opt.desc}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Hairline separator outside footer */}
      <View style={[styles.footerHairline, { position: 'absolute', bottom: BUTTON_HEIGHT + 8 + 20 + insets.bottom, left: 0, right: 0 }]} />

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 8, paddingTop: 20 }]}>
        <TouchableOpacity
          disabled={!waterIntake}
          style={[styles.nextBtn, { backgroundColor: waterIntake ? '#010103' : '#b2b2b4', height: BUTTON_HEIGHT, borderRadius: BUTTON_HEIGHT / 2 }]}
          onPress={() => router.push('/(public)/6-paywall')}
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
  title: { fontSize: 31.5, fontWeight: '700', letterSpacing: -0.2, color: '#111', marginBottom: 12, fontFamily: 'SFProDisplay-Bold' },
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
  nextText: { fontSize: 18, fontFamily: 'SFProDisplay-Medium', color: '#fff' },
  optionContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    width: '100%',
    paddingHorizontal: SIDE_MARGIN,
    marginTop: 40,
  },
  optionCard: {
    width: '100%',
    borderRadius: 16,
    paddingVertical: 22,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  optionRow: { flexDirection: 'row', alignItems: 'center' },
  optionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionTitle: { fontSize: 15, fontFamily: 'SFProDisplay-Bold' },
  optionDesc: { fontSize: 12, fontFamily: 'SFProDisplay-Medium', marginTop: 4 },
}); 