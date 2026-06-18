import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import {
	SegmentedControl,
	SegmentedControlItem,
} from "@/src/components/ui/segmented-control";
import { Switch } from "@/src/components/ui/switch";
import { Text } from "@/src/components/ui/text";
import {
	elevation,
	shadowStyle,
	useThemeColors,
} from "@/src/constants/design-tokens";
import { usePrefsStore } from "@/src/stores/prefs-store";

const SCALE_OPTIONS = [
	{ key: "small", value: 0.9 },
	{ key: "default", value: 1 },
	{ key: "large", value: 1.15 },
] as const;

export function DisplaySettingsContent() {
	const { t } = useTranslation("settings");
	const themeColors = useThemeColors();
	const fontScale = usePrefsStore((s) => s.fontScale);
	const setFontScale = usePrefsStore((s) => s.setFontScale);
	const reduceMotion = usePrefsStore((s) => s.reduceMotion);
	const setReduceMotion = usePrefsStore((s) => s.setReduceMotion);

	// Closest option to the stored scale (stored value may sit between presets).
	const active = SCALE_OPTIONS.reduce((best, opt) =>
		Math.abs(opt.value - fontScale) < Math.abs(best.value - fontScale)
			? opt
			: best,
	);

	return (
		<ScrollView
			className="flex-1 bg-surface"
			contentContainerClassName="px-screen-x py-stack-xl gap-stack-2xl"
		>
			<View>
				<Text
					variant="caption"
					className="mb-stack-md font-semibold text-content-secondary uppercase"
				>
					{t("display.textSize")}
				</Text>
				<SegmentedControl
					tone="surface"
					style={{ backgroundColor: themeColors.surfaceElevated }}
				>
					{SCALE_OPTIONS.map((opt) => {
						const isActive = active.key === opt.key;
						return (
							<SegmentedControlItem
								key={opt.key}
								onPress={() => setFontScale(opt.value)}
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
								<Text
									variant="bodySm"
									className="font-medium"
									style={{
										color: isActive
											? themeColors.primary
											: themeColors.textMuted,
									}}
								>
									{t(`display.size.${opt.key}`)}
								</Text>
							</SegmentedControlItem>
						);
					})}
				</SegmentedControl>
				<Text variant="body" className="mt-stack-lg text-content">
					{t("display.previewText")}
				</Text>
			</View>

			<View className="flex-row items-center gap-stack-md">
				<View className="flex-1">
					<Text variant="buttonLg" className="text-content">
						{t("display.reduceMotion")}
					</Text>
					<Text variant="caption" className="mt-stack-xs text-content-muted">
						{t("display.reduceMotionHint")}
					</Text>
				</View>
				<Switch
					checked={reduceMotion}
					onCheckedChange={(next) => setReduceMotion(next)}
				/>
			</View>
		</ScrollView>
	);
}
