import { useTranslation } from "react-i18next";
import { View } from "react-native";
import {
	SegmentedControl,
	SegmentedControlItem,
} from "@/src/components/ui/segmented-control";
import { Text } from "@/src/components/ui/text";
import {
	elevation,
	shadowStyle,
	useThemeColors,
} from "@/src/constants/design-tokens";
import { type Language, SUPPORTED_LANGUAGES } from "@/src/constants/i18n";
import { useLanguageStore } from "@/src/stores/language-store";

export function LanguageSegmentedControl() {
	const { t } = useTranslation("common");
	const language = useLanguageStore((state) => state.language);
	const setLanguage = useLanguageStore((state) => state.setLanguage);
	const themeColors = useThemeColors();

	// Autonyms (each language in its own script), shown regardless of the
	// currently active language.
	const labels: Record<Language, string> = {
		en: t("english"),
		ar: t("arabic"),
	};

	return (
		<SegmentedControl
			tone="surface"
			style={{ backgroundColor: themeColors.surfaceElevated }}
		>
			{SUPPORTED_LANGUAGES.map((value) => {
				const isActive = language === value;

				return (
					<SegmentedControlItem
						key={value}
						onPress={() => {
							void setLanguage(value);
						}}
						style={{
							backgroundColor: isActive
								? themeColors.surfaceBase
								: "transparent",
							...(isActive
								? shadowStyle(elevation.flat, {
										shadowColor: themeColors.shadow,
									})
								: undefined),
						}}
					>
						<View className="flex-row items-center justify-center gap-control-segmented">
							<Text
								variant="bodySm"
								className="font-medium text-sm"
								style={{
									color: isActive ? themeColors.primary : themeColors.textMuted,
								}}
							>
								{labels[value]}
							</Text>
						</View>
					</SegmentedControlItem>
				);
			})}
		</SegmentedControl>
	);
}
