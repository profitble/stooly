import React, { useMemo, useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { StyleSheet, SafeAreaView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import OnboardingProgress from '@/components/OnboardingProgress';
import {
  Box,
  Text,
  Pressable,
  Button,
  ButtonText,
} from '@gluestack-ui/themed';
import { moderateScale } from '@/styles/sizing';

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

  const [metric, setMetric] = useState(false);
  const [heightValue, setHeightValue] = useState('72');
  const [weightValue, setWeightValue] = useState('200');

  const metricHeights = useMemo(generateMetricHeight, []);
  const metricWeights = useMemo(generateMetricWeight, []);
  const imperialHeights = useMemo(generateImperialHeight, []);
  const imperialWeights = useMemo(generateImperialWeight, []);

  const heightItems = metric ? metricHeights : imperialHeights;
  const weightItems = metric ? metricWeights : imperialWeights;

  const handleNext = () => {
    router.push('/(public)/5-water');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Box
        flexDirection="row"
        alignItems="center"
        paddingHorizontal={SIDE_MARGIN}
        marginBottom={12}
      >
        <Pressable
          width={36}
          height={36}
          borderRadius={18}
          backgroundColor="#E5E5E5"
          justifyContent="center"
          alignItems="center"
          marginRight={16}
          onPress={() => router.back()}
        >
          <ArrowLeft size={20} strokeWidth={1.5} color="#111" />
        </Pressable>
        <Box
          flex={1}
          height={5}
          backgroundColor="#F0F0F0"
          borderRadius={9999}
          overflow="hidden"
        >
          <OnboardingProgress step={4} />
        </Box>
      </Box>

      {/* Title & subtitle */}
      <Box paddingHorizontal={SIDE_MARGIN}>
        <Text
          fontWeight="$bold"
          color="$primaryText"
          marginBottom={12}
          sx={{ fontSize: moderateScale(32), letterSpacing: -0.2 }}
        >
          Height & weight
        </Text>
        <Text color="$primaryText" marginBottom={24} sx={{ fontSize: moderateScale(18) }}>
          This will be used to calibrate your{"\n"}custom plan.
        </Text>
      </Box>

      {/* Unit switch */}
      <Box
        width={320}
        alignSelf="center"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        position="relative"
        marginTop={60}
        marginBottom={24}
      >
        <Text
          width={160}
          textAlign="center"
          fontWeight="$medium"
          color={!metric ? '$primaryText' : '#d5d5d7'}
          sx={{ fontSize: moderateScale(22), transform: [{ translateX: -15 }] }}
        >
          Imperial
        </Text>
        <Box
          position="absolute"
          left="50%"
          width={160}
          alignItems="center"
          sx={{ marginLeft: -80 }}
        >
          <Switch
            value={metric}
            onValueChange={() => {
              setMetric(prev => {
                const next = !prev;
                if (next) {
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
          />
        </Box>
        <Text
          width={160}
          textAlign="center"
          fontWeight="$medium"
          color={metric ? '$primaryText' : '#d5d5d7'}
          sx={{ fontSize: moderateScale(22), transform: [{ translateX: 15 }] }}
        >
          Metric
        </Text>
      </Box>

      {/* Pickers */}
      <Box flexDirection="row" justifyContent="space-evenly" flex={1}>
        <Box alignItems="center">
          <Text
            fontWeight="$medium"
            color="$primaryText"
            textAlign="center"
            marginBottom={4}
            sx={{ fontSize: moderateScale(18) }}
          >
            Height
          </Text>
          <Box width={160} height={165} justifyContent="center">
            <Box
              pointerEvents="none"
              position="absolute"
              left={0}
              right={0}
              top="50%"
              height={34}
              marginTop={-17}
              backgroundColor="#f7f4f8"
              borderRadius={10}
            />
            <Picker
              selectedValue={heightValue}
              onValueChange={setHeightValue}
              style={{ width: 160, height: 165 }}
              itemStyle={{ fontSize: 16, fontWeight: '400', color: '#111' }}
            >
              {heightItems.map((item) => (
                <Picker.Item key={item.value} label={item.label} value={item.value} />
              ))}
            </Picker>
          </Box>
        </Box>
        <Box alignItems="center">
          <Text
            fontWeight="$medium"
            color="$primaryText"
            textAlign="center"
            marginBottom={4}
            sx={{ fontSize: moderateScale(18) }}
          >
            Weight
          </Text>
          <Box width={160} height={165} justifyContent="center">
            <Box
              pointerEvents="none"
              position="absolute"
              left={0}
              right={0}
              top="50%"
              height={34}
              marginTop={-17}
              backgroundColor="#f7f4f8"
              borderRadius={10}
            />
            <Picker
              selectedValue={weightValue}
              onValueChange={setWeightValue}
              style={{ width: 160, height: 165 }}
              itemStyle={{ fontSize: 16, fontWeight: '400', color: '#111' }}
            >
              {weightItems.map((item) => (
                <Picker.Item key={item.value} label={item.label} value={item.value} />
              ))}
            </Picker>
          </Box>
        </Box>
      </Box>

      {/* Footer */}
      <Box
        position="absolute"
        left={0}
        right={0}
        bottom={0}
        backgroundColor="$background"
        borderTopWidth={StyleSheet.hairlineWidth}
        borderColor="rgba(229,231,235,0.4)"
        sx={{
          paddingHorizontal: SIDE_MARGIN,
          paddingTop: 20,
          paddingBottom: insets.bottom + 8,
        }}
      >
        <Button
          width="100%"
          height={BUTTON_HEIGHT}
          borderRadius={BUTTON_HEIGHT / 2}
          backgroundColor="#010103"
          justifyContent="center"
          alignItems="center"
          onPress={handleNext}
        >
          <ButtonText color="$white" fontWeight="$medium" sx={{ fontSize: moderateScale(18) }}>
            Next
          </ButtonText>
        </Button>
      </Box>
    </SafeAreaView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
}); 