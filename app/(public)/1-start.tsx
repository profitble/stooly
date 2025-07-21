import React from 'react';
import {
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Box,
  Text,
  Button,
  ButtonText,
  Image,
} from '@gluestack-ui/themed';
import { horizontalScale, verticalScale, moderateScale } from '@/styles/sizing';

const SIDE_MARGIN = horizontalScale(26);
const BUTTON_HEIGHT = verticalScale(60);

export default function SigninScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleContinue = () => {
    router.push('/(public)/2-gender');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Box
        flex={1}
        justifyContent="center"
        alignItems="center"
        sx={{
          paddingHorizontal: SIDE_MARGIN,
          paddingBottom: verticalScale(250),
        }}
      >
        <Image
          source={require('@/assets/images/cover.png')}
          resizeMode="contain"
          alt="A cartoon poop emoji in a toilet."
          sx={{
            width: '100%',
            height: '100%',
            maxWidth: 400,
          }}
        />
      </Box>

      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        backgroundColor="$background"
        alignItems="center"
        sx={{
          paddingHorizontal: SIDE_MARGIN,
          paddingTop: verticalScale(32),
          paddingBottom: insets.bottom > 0 ? insets.bottom + 50 : 170,
        }}
      >
        <Box
          width="100%"
          sx={{
            marginBottom: verticalScale(32),
          }}
        >
          <Text
            textAlign="center"
            color="$primaryText"
            fontWeight="$bold"
            letterSpacing={-0.4}
            sx={{
              fontSize: moderateScale(36),
            }}
          >
            Welcome to <Text color="$primary">Stooly</Text>
          </Text>
          <Text
            textAlign="center"
            color="$secondaryText"
            fontWeight="$regular"
            sx={{
              fontSize: moderateScale(18),
              marginTop: verticalScale(12),
            }}
          >
            Build Habits Towards Better Gut Health
          </Text>
        </Box>

        <Button
          onPress={handleContinue}
          width="100%"
          backgroundColor="#010103"
          justifyContent="center"
          alignItems="center"
          sx={{
            height: BUTTON_HEIGHT,
            borderRadius: moderateScale(16),
          }}
          accessibilityRole="button"
          accessibilityLabel="Start"
        >
          <ButtonText
            color="$buttonText"
            fontWeight="$medium"
            sx={{
              fontSize: moderateScale(18),
            }}
          >
            Start
          </ButtonText>
        </Button>
      </Box>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdfdfd',
  },
}); 