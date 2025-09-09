// app/(tabs)/_layout.tsx
import { Stack } from 'expo-router';

export default function TabLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="profilepayment" options={{ headerShown: false }} />
    </Stack>
  );
}