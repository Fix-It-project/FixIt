import { Palette } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
	type ThemePreference,
	themeRegistry,
} from "@/src/constants/design-tokens";
import { useColorScheme } from "@/src/hooks/use-color-scheme";
import { SelectionDialog, type SelectionDialogOption } from "./SelectionDialog";
import { SettingsItem } from "./SettingsItem";

const THEME_ORDER: ThemePreference[] = ["light", "white", "dark", "system"];

/** Two-color preview chip per theme, pulled from the theme registry (no hex). */
function swatchFor(pref: ThemePreference): string[] {
	if (pref === "system") {
		return [themeRegistry.light.surfaceBase, themeRegistry.dark.surfaceBase];
	}
	const tokens = themeRegistry[pref];
	return [tokens.surfaceBase, tokens.primary];
}

export function ThemeSettingRow() {
	const { t } = useTranslation("common");
	const { t: ts } = useTranslation("settings");
	const { preference, setPreference } = useColorScheme();
	const [open, setOpen] = useState(false);

	const options: SelectionDialogOption[] = THEME_ORDER.map((pref) => ({
		key: pref,
		label: t(`theme.${pref}` as Parameters<typeof t>[0]),
		swatches: swatchFor(pref),
	}));

	return (
		<>
			<SettingsItem
				icon={Palette}
				label={ts("appearance.theme")}
				rightText={t(`theme.${preference}` as Parameters<typeof t>[0])}
				onPress={() => setOpen(true)}
			/>
			<SelectionDialog
				visible={open}
				onClose={() => setOpen(false)}
				title={ts("appearance.theme")}
				value={preference}
				onValueChange={(key) => {
					setPreference(key as ThemePreference);
					setOpen(false);
				}}
				options={options}
			/>
		</>
	);
}
