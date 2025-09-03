// app/(auth)/_layout.tsx
import { Stack } from 'expo-router';

export default function AuthLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
			}}
		>
			<Stack.Screen name="Language" options={{ headerShown: false }} />
			<Stack.Screen name="PhoneNumber" options={{ headerShown: false }} />
			<Stack.Screen name="SMSCode" options={{ headerShown: false }} />
			<Stack.Screen name="PersonalInfo" options={{ headerShown: false }} />
		</Stack>
	);
}