import React, { useState } from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
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

const SIDE_MARGIN = 26;
const BUTTON_HEIGHT = 60;

const ageRanges = [
  { value: '13-19', title: '13-19', desc: 'Puberty' },
  { value: '20-35', title: '20-35', desc: 'Lifestyle driven' },
  { value: '36-50', title: '36-50+', desc: 'Hormonal shifts' },
];

export default function AgeRangeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [ageRange, setAgeRange] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with back arrow and progress */}
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
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          marginRight={16}
        >
          <ArrowLeft size={20} strokeWidth={1.5} color="#111" />
        </Pressable>
        <Box
          flex={1}
          height={5}
          borderRadius={9999}
          backgroundColor="#F0F0F0"
          overflow="hidden"
        >
          <OnboardingProgress step={3} />
        </Box>
      </Box>

      <Box paddingHorizontal={SIDE_MARGIN}>
        <Text fontWeight="$bold" color="$primaryText" marginBottom={12} sx={{ fontSize: moderateScale(32) }}>
          How old are you?
        </Text>
        <Text color="$primaryText" marginBottom={24} sx={{ fontSize: moderateScale(18) }}>
          This will be used to calibrate your{"\n"}custom plan.
        </Text>
      </Box>

      {/* Age range selection buttons */}
      <Box
        flex={1}
        justifyContent="flex-start"
        width="100%"
        paddingHorizontal={SIDE_MARGIN}
        marginTop={60}
      >
        {ageRanges.map((item) => {
          const selected = ageRange === item.value;
          return (
            <Pressable
              key={item.value}
              width="100%"
              borderRadius={16}
              justifyContent="center"
              alignItems="flex-start"
              marginBottom={20}
              paddingHorizontal={20}
              paddingVertical={22}
              backgroundColor={selected ? '#010103' : '#FFFFFF'}
              onPress={() => setAgeRange(item.value)}
              accessibilityRole="button"
              accessibilityLabel={item.title}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text color={selected ? '$white' : '$primaryText'} fontWeight="$medium" sx={{ fontSize: moderateScale(18) }}>
                {item.title}
              </Text>
              <Text color={selected ? '#e5e7eb' : '#6b7280'} fontWeight="$medium" sx={{ fontSize: moderateScale(16), marginTop: 4 }}>
                {item.desc}
              </Text>
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
          disabled={!ageRange}
          width="100%"
          height={BUTTON_HEIGHT}
          borderRadius={BUTTON_HEIGHT / 2}
          backgroundColor={ageRange ? '#010103' : '#b2b2b4'}
          justifyContent="center"
          alignItems="center"
          onPress={() => router.push('/(public)/4-size')}
          accessibilityRole="button"
          accessibilityLabel="Next"
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