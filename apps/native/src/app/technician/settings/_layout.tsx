import { Stack } from "expo-router";

export default function TechnicianSettingsLayout() {
	return (
		<Stack>
			<Stack.Screen
				name="index"
				options={{
					title: "Settings",
					headerShown: true,
					headerBackTitle: "Back",
				}}
			/>
			<Stack.Screen
				name="address"
				options={{
					title: "Service location",
					headerShown: true,
					headerBackTitle: "Settings",
				}}
			/>
			<Stack.Screen
				name="services"
				options={{
					title: "Services",
					headerShown: true,
					headerBackTitle: "Settings",
				}}
			/>
			<Stack.Screen
				name="privacy-security"
				options={{
					title: "Privacy & Security",
					headerShown: true,
					headerBackTitle: "Settings",
				}}
			/>
			<Stack.Screen
				name="help-support"
				options={{
					title: "Help & Support",
					headerShown: true,
					headerBackTitle: "Settings",
				}}
			/>
		</Stack>
	);
}
