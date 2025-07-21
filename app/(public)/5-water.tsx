import React, { useState } from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import OnboardingProgress from '@/components/OnboardingProgress';
import Octicons from '@expo/vector-icons/Octicons';
import { CirclesThree, DotsSixVertical } from 'phosphor-react-native';
import {
  Box,
  Text,
  Pressable,
  Button,
  ButtonText,
} from '@gluestack-ui/themed';
import { moderateScale } from '@/styles/sizing';

const SIDE_MARGIN = 26;
const BUTTON_HEIGHT = 60;

const waterOptions = [
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
];

export default function WaterIntakeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [waterIntake, setWaterIntake] = useState<string | null>(null);

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
          <OnboardingProgress step={5} />
        </Box>
      </Box>

      {/* Title & subtitle */}
      <Box paddingHorizontal={SIDE_MARGIN}>
        <Text
          fontWeight="$bold"
          color="$primaryText"
          marginBottom={12}
          sx={{ fontSize: moderateScale(31.5), letterSpacing: -0.2 }}
        >
          How many cups of water do you drink{"\n"}per day?
        </Text>
        <Text color="$primaryText" marginBottom={24} sx={{ fontSize: moderateScale(18) }}>
          This will be used to calibrate your{"\n"}custom plan.
        </Text>
      </Box>

      {/* Options */}
      <Box
        flex={1}
        justifyContent="flex-start"
        width="100%"
        paddingHorizontal={SIDE_MARGIN}
        marginTop={40}
      >
        {waterOptions.map((opt) => {
          const selected = waterIntake === opt.value;
          return (
            <Pressable
              key={opt.value}
              width="100%"
              borderRadius={16}
              paddingVertical={22}
              paddingHorizontal={20}
              marginBottom={20}
              backgroundColor={selected ? '#010103' : '#ffffff'}
              onPress={() => setWaterIntake(opt.value)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Box flexDirection="row" alignItems="center">
                <Box
                  width={40}
                  height={40}
                  borderRadius={20}
                  backgroundColor="#fff"
                  justifyContent="center"
                  alignItems="center"
                >
                  {opt.icon()}
                </Box>
                <Box marginLeft={14}>
                  <Text
                    color={selected ? '$white' : '$primaryText'}
                    fontWeight="$medium"
                    sx={{ fontSize: moderateScale(15) }}
                  >
                    {opt.title}
                  </Text>
                  <Text
                    color={selected ? '#e5e7eb' : '#6b7280'}
                    fontWeight="$medium"
                    sx={{ fontSize: moderateScale(12), marginTop: 4 }}
                  >
                    {opt.desc}
                  </Text>
                </Box>
              </Box>
            </Pressable>
          );
        })}
      </Box>

      {/* Footer */}
      <Box
        position="absolute"
        left={0}
        right={0}
        bottom={0}
        backgroundColor="#fdfdfd"
        borderTopWidth={StyleSheet.hairlineWidth}
        borderColor="rgba(229,231,235,0.4)"
        sx={{
          paddingHorizontal: SIDE_MARGIN,
          paddingTop: 20,
          paddingBottom: insets.bottom + 8,
        }}
      >
        <Button
          disabled={!waterIntake}
          width="100%"
          height={BUTTON_HEIGHT}
          borderRadius={BUTTON_HEIGHT / 2}
          backgroundColor={waterIntake ? '#010103' : '#b2b2b4'}
          justifyContent="center"
          alignItems="center"
          onPress={() => router.push('/(public)/6-paywall')}
        >
          <ButtonText color="$white" fontWeight="$medium" sx={{ fontSize: moderateScale(18) }}>
            Next
          </ButtonText>
        </Button>
      </Box>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f1f4' },
}); 