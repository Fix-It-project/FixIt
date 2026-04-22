import { Moon, Smartphone, Sun } from "lucide-react-native";
import { View } from "react-native";
import {
	SegmentedControl,
	SegmentedControlItem,
} from "@/src/components/ui/segmented-control";
import { Text } from "@/src/components/ui/text";
import {
	type ThemeOption,
	useThemeEasterEgg,
} from "@/src/features/settings/hooks/useThemeEasterEgg";
import { useColorScheme } from "@/src/hooks/use-color-scheme";
import { elevation, shadowStyle, useThemeColors } from "@/src/lib/theme";

const OPTIONS: ThemeOption[] = [
	{ value: "light", label: "Light", Icon: Sun },
	{ value: "dark", label: "Dark", Icon: Moon },
	{ value: "system", label: "System", Icon: Smartphone },
];

export function ThemeSegmentedControl() {
	const { preference, setPreference } = useColorScheme();
	const themeColors = useThemeColors();
	const { options, handlePreferencePress } = useThemeEasterEgg(
		setPreference,
		OPTIONS,
	);

	return (
		<SegmentedControl
			tone="surface"
			style={{
				backgroundColor: themeColors.surfaceElevated,
			}}
		>
			{options.map(({ value, label, Icon }) => {
				const isActive = preference === value;

				return (
					<SegmentedControlItem
						key={value}
						onPress={() => handlePreferencePress(value)}
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
							<Icon
								size={16}
								strokeWidth={1.8}
								color={isActive ? themeColors.primary : themeColors.textMuted}
							/>
							<Text
								className="font-medium text-sm"
								style={{
									color: isActive ? themeColors.primary : themeColors.textMuted,
								}}
							>
								{label}
							</Text>
						</View>
					</SegmentedControlItem>
				);
			})}
		</SegmentedControl>
	);
}
