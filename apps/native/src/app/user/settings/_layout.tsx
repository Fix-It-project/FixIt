import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { useThemeColors } from "@/src/constants/design-tokens";
import {
	buildSettingsStackOptions,
	settingsScreenOptions,
} from "@/src/lib/navigation";

export default function SettingsLayout() {
	const { t } = useTranslation("settings");
	const themeColors = useThemeColors();

	return (
		<Stack screenOptions={buildSettingsStackOptions(themeColors)}>
			<Stack.Screen
				name="index"
				options={settingsScreenOptions(t("layout.settings"), t("layout.back"))}
			/>
			<Stack.Screen
				name="privacy-security"
				options={settingsScreenOptions(
					t("privacy.title"),
					t("layout.settings"),
				)}
			/>
			<Stack.Screen
				name="help-support"
				options={settingsScreenOptions(t("help.title"), t("layout.settings"))}
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
		</Stack>
	);
}
