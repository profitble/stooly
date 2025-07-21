import { Stack } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'about',
};

export default function PublicLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#fbf7f4' },
        animation: 'slide_from_right',
        animationDuration: 1000,
      }}
    >
      <Stack.Screen
        name="1-start"
        options={{
          animation: 'none',
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}