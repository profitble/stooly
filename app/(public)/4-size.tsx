/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import OnboardingProgress from '@/components/OnboardingProgress';
import { themeColors } from '@/styles/theme';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore – library lacks bundled TypeScript declarations
import WheelPickerExpo from 'react-native-wheel-picker-expo';

// Constants
const SIDE_MARGIN = 26;
const BUTTON_HEIGHT = 60;
const METRIC_HEIGHT_MIN = 140; // cm
const METRIC_HEIGHT_MAX = 200; // cm
const METRIC_WEIGHT_MIN = 40; // kg
const METRIC_WEIGHT_MAX = 150; // kg

const IMP_HEIGHT_MIN_IN = 54; // 4'6" in inches
const IMP_HEIGHT_MAX_IN = 78; // 6'6"
const IMP_WEIGHT_MIN_LB = 90;
const IMP_WEIGHT_MAX_LB = 330;
// Helpers to generate picker data
const generateMetricHeight = () =>
  Array.from({ length: METRIC_HEIGHT_MAX - METRIC_HEIGHT_MIN + 1 }).map((_, i) => {
    const val = METRIC_HEIGHT_MIN + i;
    return { label: `${val} cm`, value: String(val) };
  });

const generateMetricWeight = () =>
  Array.from({ length: METRIC_WEIGHT_MAX - METRIC_WEIGHT_MIN + 1 }).map((_, i) => {
    const val = METRIC_WEIGHT_MIN + i;
    return { label: `${val} kg`, value: String(val) };
  });

const generateImperialHeight = () => {
  const arr: { label: string; value: string }[] = [];
  for (let i = IMP_HEIGHT_MIN_IN; i <= IMP_HEIGHT_MAX_IN; i++) {
    const feet = Math.floor(i / 12);
    const inches = i % 12;
    arr.push({ label: `${feet}' ${inches}"`, value: String(i) });
  }
  return arr;
};

const generateImperialWeight = () => {
  return Array.from({ length: IMP_WEIGHT_MAX_LB - IMP_WEIGHT_MIN_LB + 1 }).map((_, i) => {
    const val = IMP_WEIGHT_MIN_LB + i;
    return { label: `${val} lb`, value: String(val) };
  });
};

export default function HeightWeightScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Unit system toggle (true = Metric, false = Imperial) – start with Imperial
  const [metric, setMetric] = useState(false);

  // Picker selections (store value for Picker)
  const [heightValue, setHeightValue] = useState('72'); // 6 ft = 72 in
  const [weightValue, setWeightValue] = useState('200');

  // Memoised picker data
  const metricHeights = useMemo(generateMetricHeight, []);
  const metricWeights = useMemo(generateMetricWeight, []);
  const imperialHeights = useMemo(generateImperialHeight, []);
  const imperialWeights = useMemo(generateImperialWeight, []);

  const heightItems = metric ? metricHeights : imperialHeights;
  const weightItems = metric ? metricWeights : imperialWeights;

  // Handlers
  const handleNext = () => {
    router.push('/(public)/5-water');
  };

  const headerProgress = '40%'; // Width percentage of progress bar fill for this step

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={20} strokeWidth={1.5} color="#111" />
        </TouchableOpacity>
        <View style={styles.progressBarBg}>
          <OnboardingProgress step={4} />
        </View>
      </View>

      {/* Title & subtitle */}
      <View style={{ paddingHorizontal: SIDE_MARGIN }}>
        <Text style={styles.title}>Height & weight</Text>
        <Text style={styles.subtitle}>
          This will be used to calibrate your{"\n"}custom plan.
        </Text>
      </View>

      {/* Unit switch with centered layout */}
      <View style={styles.unitRow}>
        <Text
          style={[styles.unitLabel, styles.unitImperial, !metric ? styles.unitActive : styles.unitInactive]}
        >
          Imperial
        </Text>

        {/* Center-aligned switch */}
        <View style={styles.switchWrap}>
          <Switch
            value={metric}
            onValueChange={() => {
              setMetric(prev => {
                const next = !prev;
                if (next) {
                  // Imperial → Metric conversion
                  const inches = parseInt(heightValue, 10);
                  let cm = Math.round(inches * 2.54);
                  cm = Math.round(cm / 10) * 10;
                  cm = Math.max(METRIC_HEIGHT_MIN, Math.min(METRIC_HEIGHT_MAX, cm));
                  const lbs = parseInt(weightValue, 10);
                  let kg = Math.round(lbs / 2.20462);
                  kg = Math.round(kg / 10) * 10;
                  kg = Math.max(METRIC_WEIGHT_MIN, Math.min(METRIC_WEIGHT_MAX, kg));
                  setHeightValue(String(cm));
                  setWeightValue(String(kg));
                } else {
                  // Metric → Imperial conversion
                  const cm = parseInt(heightValue, 10);
                  let inches = Math.round(cm / 2.54);
                  inches = Math.max(IMP_HEIGHT_MIN_IN, Math.min(IMP_HEIGHT_MAX_IN, inches));
                  const kg = parseInt(weightValue, 10);
                  let lbs = Math.round(kg * 2.20462);
                  lbs = Math.round(lbs / 10) * 10;
                  lbs = Math.max(IMP_WEIGHT_MIN_LB, Math.min(IMP_WEIGHT_MAX_LB, lbs));
                  setHeightValue(String(inches));
                  setWeightValue(String(lbs));
                }
                return next;
              });
            }}
            trackColor={{ false: '#090909', true: '#090909' }}
            thumbColor="#ffffff"
            ios_backgroundColor="#090909"
            accessibilityLabel="Toggle unit system"
          />
        </View>

        <Text
          style={[styles.unitLabel, styles.unitMetric, metric ? styles.unitActive : styles.unitInactive]}
        >
          Metric
        </Text>
      </View>

      {/* Pickers with fade effect and aligned labels */}
      <View style={styles.pickerRow}>
        <View style={styles.pickerColumn}>
          <View style={{ alignItems: 'center', marginBottom: 4 }}>
            <Text style={styles.pickerHeading}>Height</Text>
          </View>
          <View style={{ width: 160, height: 165, justifyContent: 'center' }}>
            {/* Selection highlight */}
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: '50%',
                height: 34,
                marginTop: -17,
                backgroundColor: '#f7f4f8',
                borderRadius: 10,
              }}
            />
            <Picker
              selectedValue={heightValue}
              onValueChange={setHeightValue}
              style={{ width: 160, height: 165, color: '#111', fontSize: 16 }}
              itemStyle={{ fontSize: 16, fontWeight: '400', color: '#111', backgroundColor: 'transparent' }}
            >
              {heightItems.map((item) => (
                <Picker.Item key={item.value} label={item.label} value={item.value} />
              ))}
            </Picker>
          </View>
        </View>
        <View style={styles.pickerColumn}>
          <View style={{ alignItems: 'center', marginBottom: 4 }}>
            <Text style={styles.pickerHeading}>Weight</Text>
          </View>
          <View style={{ width: 160, height: 165, justifyContent: 'center' }}>
            {/* Selection highlight */}
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: '50%',
                height: 34,
                marginTop: -17,
                backgroundColor: '#f7f4f8',
                borderRadius: 10,
              }}
            />
            <Picker
              selectedValue={weightValue}
              onValueChange={setWeightValue}
              style={{ width: 160, height: 165, color: '#111', fontSize: 16 }}
              itemStyle={{ fontSize: 16, fontWeight: '400', color: '#111', backgroundColor: 'transparent' }}
            >
              {weightItems.map((item) => (
                <Picker.Item key={item.value} label={item.label} value={item.value} />
              ))}
            </Picker>
          </View>
        </View>
      </View>

      {/* Footer hairline */}
      <View
        style={[
          styles.footerHairline,
          {
            position: 'absolute',
            bottom: BUTTON_HEIGHT + 8 + 20 + insets.bottom,
            left: 0,
            right: 0,
          },
        ]}
      />

      {/* Footer */}
      <View
        style={[
          styles.footer,
          { paddingBottom: insets.bottom + 8, paddingTop: 20 },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.nextBtn,
            {
              backgroundColor: '#010103',
              height: BUTTON_HEIGHT,
              borderRadius: BUTTON_HEIGHT / 2,
            },
          ]}
          onPress={handleNext}
          accessibilityRole="button"
          accessibilityLabel="Next"
        >
          <Text style={styles.nextText}>Next</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: themeColors.gradientEnd },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIDE_MARGIN,
    marginBottom: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  progressBarBg: {
    flex: 1,
    height: 5,
    backgroundColor: '#F0F0F0',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#111',
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -0.2,
    color: '#111',
    marginBottom: 12,
    fontFamily: 'SFProDisplay-Bold',
  },
  subtitle: {
    fontSize: 18,
    color: '#111',
    marginBottom: 24,
  },
  unitRow: {
    width: 320,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    marginTop: 60,
    marginBottom: 24,
  },
  unitLabel: {
    width: 160,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
  },
  unitActive: { color: '#090909' },
  unitInactive: { color: '#d5d5d7' },
  unitImperial: { transform: [{ translateX: -15 }] },
  unitMetric: { transform: [{ translateX: 15 }] },
  switchWrap: {
    position: 'absolute',
    left: '50%',
    marginLeft: -80, // half of 160
    width: 160,
    alignItems: 'center',
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    flex: 1,
  },
  pickerColumn: {
    alignItems: 'center',
  },
  pickerHeading: {
    fontSize: 18,
    color: '#111',
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: themeColors.background,
    paddingHorizontal: SIDE_MARGIN,
    alignItems: 'center',
  },
  footerHairline: {
    width: '100%',
    height: StyleSheet.hairlineWidth + 1,
    backgroundColor: 'rgba(229,231,235,0.4)',
  },
  nextBtn: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  nextText: {
    fontSize: 18,
    fontFamily: 'SFProDisplay-Medium',
    color: '#fff',
  },
}); 