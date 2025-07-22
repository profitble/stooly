import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import OnboardingProgress from '@/components/OnboardingProgress';

export default function ReviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [gender, setGender] = useState<string | null>(null);

  return (
    <SafeAreaView className="flex-1 bg-[#f4f1f4]">
      {/* Header with back arrow and progress */}
      <View className="flex-row items-center px-[26px] mb-4">
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
          <OnboardingProgress step={2} />
        </View>
      </View>

      <View className="px-[26px]">
        <Text className="text-[32px] font-bold text-[#111] mb-3">
          Choose your Gender
        </Text>
        <Text className="text-[18px] text-[#111] mb-6">
          This will be used to calibrate your{"\n"}custom plan.
        </Text>
      </View>

      {/* Gender selection buttons */}
      <View className="flex-1 justify-start w-full px-[26px] mt-[120px]">
        {['Male', 'Female'].map((label) => {
          const selected = gender === label.toLowerCase();
          return (
            <Pressable
              key={label}
              onPress={() => setGender(label.toLowerCase())}
              accessibilityRole="button"
              accessibilityLabel={label}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              className={`w-full h-[60px] rounded-xl justify-center items-center mb-5 ${selected ? 'bg-black' : 'bg-white'}`}
            >
              <Text className={`text-xl font-medium ${selected ? 'text-white' : 'text-[#111]'}`}>
                {label}
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
          disabled={!gender}
          onPress={() => router.push('/(public)/3-age')}
          accessibilityRole="button"
          accessibilityLabel="Next"
          className={`w-full h-[60px] rounded-full justify-center items-center ${gender ? 'bg-black' : 'bg-[#b2b2b4]'}`}
        >
          <Text className="text-white font-medium text-xl">Next</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}