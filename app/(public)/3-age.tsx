import React, { useState } from 'react';
import { SafeAreaView, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import OnboardingProgress from '@/components/OnboardingProgress';

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
    <SafeAreaView className="flex-1 bg-[#f4f1f4]">
      {/* Header with back arrow and progress */}
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
        <View className="flex-1 h-[5px] rounded-full bg-[#F0F0F0] overflow-hidden">
          <OnboardingProgress step={3} />
        </View>
      </View>

      <View className="px-[26px]">
        <Text className="text-[32px] font-bold text-[#111] mb-3">
          How old are you?
        </Text>
        <Text className="text-[18px] text-[#111] mb-6">
          This will be used to calibrate your{"\n"}custom plan.
        </Text>
      </View>

      {/* Age range selection buttons */}
      <View className="flex-1 justify-start w-full px-[26px] mt-[80px]">
        {ageRanges.map((item) => {
          const selected = ageRange === item.value;
          return (
            <Pressable
              key={item.value}
              onPress={() => setAgeRange(item.value)}
              accessibilityRole="button"
              accessibilityLabel={item.title}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              className={selected ? 'w-full rounded-2xl justify-center items-start mb-5 px-5 py-[22px] bg-black' : 'w-full rounded-2xl justify-center items-start mb-5 px-5 py-[22px] bg-white'}
            >
              <Text className={selected ? 'text-xl font-medium text-white' : 'text-xl font-medium text-[#111]'}>
                {item.title}
              </Text>
              <Text className={selected ? 'mt-1 font-medium text-gray-200' : 'mt-1 font-medium text-gray-500'}>
                {item.desc}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Footer */}
      <View
        className="absolute left-0 right-0 bottom-0 bg-[#fdfdfd] border-t border-[#E5E7EB]/40 px-[26px] pt-5"
        style={{ paddingBottom: insets.bottom + 8 }}
      >
        <Pressable
          disabled={!ageRange}
          className={ageRange ? 'w-full h-[60px] rounded-full justify-center items-center bg-black' : 'w-full h-[60px] rounded-full justify-center items-center bg-[#b2b2b4]'}
          onPress={() => router.push('/(public)/4-size')}
          accessibilityRole="button"
          accessibilityLabel="Next"
        >
          <Text className="text-white font-medium text-xl">Next</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}