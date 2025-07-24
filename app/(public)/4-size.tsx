import React, { useMemo, useState, useCallback } from 'react';
import { Picker } from '@react-native-picker/picker';
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import OnboardingProgress from '@/components/OnboardingProgress';
// Constants
const SIDE_MARGIN = 26;
const BUTTON_HEIGHT = 60;
const METRIC_HEIGHT_MIN = 140; // cm
const METRIC_HEIGHT_MAX = 200; // cm
const METRIC_WEIGHT_MIN = 40; // kg
const METRIC_WEIGHT_MAX = 150; // kg

const IMP_HEIGHT_MIN_IN = 48; // 4'0" in inches
const IMP_HEIGHT_MAX_IN = 96; // 8'0" in inches
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

const generateImperialWeight = () =>
  Array.from({ length: IMP_WEIGHT_MAX_LB - IMP_WEIGHT_MIN_LB + 1 }).map((_, i) => {
    const val = IMP_WEIGHT_MIN_LB + i;
    return { label: `${val} lb`, value: String(val) };
  });

export default function HeightWeightScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [metric, setMetric] = useState(false);
  const [heightValue, setHeightValue] = useState('72');
  const [weightValue, setWeightValue] = useState('200');

  const metricHeights = useMemo(generateMetricHeight, []);
  const metricWeights = useMemo(generateMetricWeight, []);
  const imperialHeights = useMemo(generateImperialHeight, []);
  const imperialWeights = useMemo(generateImperialWeight, []);

  const heightItems = metric ? metricHeights : imperialHeights;
  const weightItems = metric ? metricWeights : imperialWeights;

  const handleNext = () => router.push('/(public)/5-water');

  return (
    <SafeAreaView className="flex-1 bg-[#f3f4f6]">
      {/* Header */}
      <View className="flex-row items-center px-[26px] mb-3">
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          className="w-9 h-9 rounded-full bg-[#E5E5E5] justify-center items-center mr-4"
        >
          <ArrowLeft size={20} strokeWidth={1.5} color="#111" />
        </Pressable>
        <View className="flex-1 h-[5px] bg-[#F0F0F0] rounded-full overflow-hidden">
          <OnboardingProgress step={4} />
        </View>
      </View>

      {/* Title & subtitle */}
      <View className="px-[26px]">
        <Text className="text-[32px] font-bold text-[#111] mb-3">Height & weight</Text>
        <Text className="text-[18px] text-[#111] mb-6">This will be used to calibrate your{"\n"}custom plan.</Text>
      </View>

      {/* Unit switch */}
      <View className="w-[320px] self-center flex-row items-center justify-between mt-[60px] mb-6">
          <Text className={!metric ? 'text-[22px] font-medium px-8 text-center text-[#111]' : 'text-[22px] font-medium px-8 text-center text-[#d5d5d7]'}>Imperial</Text>
          <Switch
            value={metric}
            onValueChange={useCallback(() => {
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
            }, [metric, heightValue, weightValue])}
            trackColor={{ false: '#090909', true: '#090909' }}
            thumbColor="#ffffff"
            ios_backgroundColor="#090909"
          />
          <Text className={metric ? 'text-[22px] font-medium px-8 text-center text-[#111]' : 'text-[22px] font-medium px-8 text-center text-[#d5d5d7]'}>Metric</Text>
        </View>

      {/* Pickers */}
      <View className="flex-1 flex-row justify-evenly">
        {/* Height */}
        <View className="items-center">
          <Text className="text-[18px] font-medium text-[#111] mb-1">Height</Text>
          <View className="w-[160px] h-[165px] justify-center relative">
            <View className="absolute left-0 right-0 top-1/2 h-[34px] -mt-[17px] bg-[#f7f4f8] rounded-[10px]" />
            <Picker
              selectedValue={heightValue}
              onValueChange={setHeightValue}
              style={{ width:160, height:165 }}
              itemStyle={{ fontSize:16, fontWeight:'400', color:'#111' }}
            >
              {heightItems.map(item => <Picker.Item key={item.value} label={item.label} value={item.value} />)}
            </Picker>
          </View>
        </View>
        {/* Weight */}
        <View className="items-center">
          <Text className="text-[18px] font-medium text-[#111] mb-1">Weight</Text>
          <View className="w-[160px] h-[165px] justify-center relative">
            <View className="absolute left-0 right-0 top-1/2 h-[34px] -mt-[17px] bg-[#f7f4f8] rounded-[10px]" />
            <Picker
              selectedValue={weightValue}
              onValueChange={setWeightValue}
              style={{ width:160, height:165 }}
              itemStyle={{ fontSize:16, fontWeight:'400', color:'#111' }}
            >
              {weightItems.map(item => <Picker.Item key={item.value} label={item.label} value={item.value} />)}
            </Picker>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View className="absolute left-0 right-0 bottom-0 bg-[#fdfdfd] border-t border-[#E5E7EB]/40 px-[26px] pt-5" style={{ paddingBottom: insets.bottom + 8 }}>
        <Pressable
          onPress={handleNext}
          className="w-full h-[60px] rounded-full bg-black justify-center items-center"
          accessibilityRole="button"
          accessibilityLabel="Next"
        >
          <Text className="text-white font-medium text-xl">Next</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
} 