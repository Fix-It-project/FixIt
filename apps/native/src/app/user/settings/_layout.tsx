import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

export default function SettingsLayout() {
	const { t } = useTranslation("settings");
	return (
		<Stack>
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
		</Stack>
	);
}
