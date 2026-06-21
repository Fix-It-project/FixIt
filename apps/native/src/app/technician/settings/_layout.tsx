import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { useThemeColors } from "@/src/constants/design-tokens";
import {
	buildSettingsStackOptions,
	settingsScreenOptions,
} from "@/src/lib/navigation";

export default function TechnicianSettingsLayout() {
	const { t } = useTranslation("settings");
	const themeColors = useThemeColors();

	return (
		<Stack screenOptions={buildSettingsStackOptions(themeColors)}>
			<Stack.Screen
				name="index"
				options={settingsScreenOptions("Settings", "Back")}
			/>
			<Stack.Screen
				name="address"
				options={settingsScreenOptions("Service location", "Settings")}
			/>
			<Stack.Screen
				name="services"
				options={settingsScreenOptions("Services", "Settings")}
			/>
			<Stack.Screen
				name="privacy-security"
				options={settingsScreenOptions("Privacy & Security", "Settings")}
			/>
			<Stack.Screen
				name="help-support"
				options={settingsScreenOptions("Help & Support", "Settings")}
			/>
			<Stack.Screen
				name="display"
				options={settingsScreenOptions(
					t("display.title"),
					t("layout.settings"),
				)}
			/>
			<Stack.Screen
				name="data"
				options={settingsScreenOptions(t("data.title"), t("layout.settings"))}
			/>
			<Stack.Screen
				name="about"
				options={settingsScreenOptions(t("about.title"), t("layout.settings"))}
			/>
			<Stack.Screen
				name="faq"
				options={settingsScreenOptions(t("menu.faq"), t("layout.settings"))}
			/>
			<Stack.Screen name="pick-location" options={{ headerShown: false }} />
		</Stack>
	);
}
