import React, { useState } from 'react';
import { SafeAreaView, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import OnboardingProgress from '@/components/OnboardingProgress';
import Octicons from '@expo/vector-icons/Octicons';
import { CirclesThree, DotsSixVertical } from 'phosphor-react-native';

// Constants
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
    <SafeAreaView className="flex-1 bg-[#f4f1f4]">
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
          <OnboardingProgress step={5} />
        </View>
      </View>

      {/* Title & subtitle */}
      <View className="px-[26px]">
        <Text className="text-[32px] font-bold text-[#111] mb-3">
          How many cups of water do you drink{"\n"}per day?
        </Text>
        <Text className="text-[18px] text-[#111] mb-6">
          This will be used to calibrate your{"\n"}custom plan.
        </Text>
      </View>

      {/* Options */}
      <View className="flex-1 justify-start w-full px-[26px] mt-10">
        {waterOptions.map((opt) => {
          const selected = waterIntake === opt.value;
          return (
            <Pressable
              key={opt.value}
              className={`w-full rounded-2xl px-5 py-[22px] mb-5 ${selected ? 'bg-black' : 'bg-white'}`}
              onPress={() => setWaterIntake(opt.value)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-white justify-center items-center">
                  {opt.icon()}
                </View>
                <View className="ml-4">
                  <Text className={`text-xl font-medium ${selected ? 'text-white' : 'text-[#111]'}`}>
                    {opt.title}
                  </Text>
                  <Text className={`mt-1 font-medium ${selected ? 'text-gray-200' : 'text-gray-500'}`}>
                    {opt.desc}
                  </Text>
                </View>
              </View>
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
          disabled={!waterIntake}
          className={`w-full h-[60px] rounded-full justify-center items-center ${waterIntake ? 'bg-black' : 'bg-[#b2b2b4]'}`}
          onPress={() => router.push('/(public)/6-paywall')}
        >
          <Text className="text-white font-medium text-xl">Next</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
} 