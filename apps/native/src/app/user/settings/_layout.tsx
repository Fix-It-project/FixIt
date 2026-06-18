import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { useThemeColors } from "@/src/constants/design-tokens";

export default function SettingsLayout() {
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
					title: t("layout.settings"),
					headerShown: true,
					headerBackTitle: t("layout.back"),
				}}
			/>
			<Stack.Screen
				name="privacy-security"
				options={{
					title: t("privacy.title"),
					headerShown: true,
					headerBackTitle: t("layout.settings"),
				}}
			/>
			<Stack.Screen
				name="help-support"
				options={{
					title: t("help.title"),
					headerShown: true,
					headerBackTitle: t("layout.settings"),
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
		</Stack>
	);
}
