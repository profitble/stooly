import React from 'react';
import { SafeAreaView, View, Text, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SigninScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleContinue = () => {
    router.push('/(public)/2-gender');
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-6 pb-[250px]">
        <Image
          source={require('@/assets/images/cover.png')}
          resizeMode="contain"
          alt="A cartoon poop emoji in a toilet."
          className="w-full aspect-square max-w-[275px]"
        />
      </View>

      <View
        className="absolute items-center bg-background px-6 pt-8"
        style={{
          bottom: 0,
          left: 0,
          right: 0,
          paddingBottom: insets.bottom > 0 ? insets.bottom + 50 : 170,
        }}
      >
        <View className="w-full mb-8">
          <Text className="text-center text-primaryText font-bold text-4xl tracking-tight">
            Welcome to <Text className="text-primary">Stooly</Text>
          </Text>
          <Text className="text-center text-secondaryText text-xl mt-3">
            Build Habits Towards Better Gut Health
          </Text>
        </View>

        <Pressable
          onPress={handleContinue}
          className="w-full items-center justify-center bg-black h-[60px] rounded-2xl"
          accessibilityRole="button"
          accessibilityLabel="Start"
        >
          <Text className="text-white font-bold text-xl">
            Start
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
} 