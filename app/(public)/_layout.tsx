import { Stack } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '1-start',
};

export default function PublicLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#fdfdfd' },
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