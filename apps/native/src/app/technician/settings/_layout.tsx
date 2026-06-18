import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { useThemeColors } from "@/src/constants/design-tokens";

export default function TechnicianSettingsLayout() {
	const { t } = useTranslation("settings");
	const themeColors = useThemeColors();

	return (
		<Stack
			screenOptions={{
				contentStyle: { backgroundColor: themeColors.surfaceBase },
				headerShadowVisible: false,
				headerStyle: { backgroundColor: themeColors.surfaceBase },
				headerTintColor: themeColors.textPrimary,
			}}
		>
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
			<Stack.Screen
				name="display"
				options={{
					title: t("display.title"),
					headerShown: true,
					headerBackTitle: t("layout.settings"),
				}}
			/>
			<Stack.Screen
				name="data"
				options={{
					title: t("data.title"),
					headerShown: true,
					headerBackTitle: t("layout.settings"),
				}}
			/>
			<Stack.Screen
				name="about"
				options={{
					title: t("about.title"),
					headerShown: true,
					headerBackTitle: t("layout.settings"),
				}}
			/>
			<Stack.Screen
				name="faq"
				options={{
					title: t("menu.faq"),
					headerShown: true,
					headerBackTitle: t("layout.settings"),
				}}
			/>
			<Stack.Screen name="pick-location" options={{ headerShown: false }} />
		</Stack>
	);
}
