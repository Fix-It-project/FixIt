import { View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/lib/theme";

function LegendItem({
	color,
	label,
}: Readonly<{ color: string; label: string }>) {
	const themeColors = useThemeColors();
	return (
		<View className="flex-row items-center gap-1.5">
			<View
				className="h-2.5 w-2.5 rounded-full"
				style={{ backgroundColor: color }}
			/>
			<Text variant="caption" style={{ color: themeColors.textMuted }}>
				{label}
			</Text>
		</View>
	);
}

export default function ScheduleLegend() {
	const themeColors = useThemeColors();
	return (
		<View className="mt-4 px-4">
			<Text
				variant="bodySm"
				className="mb-2.5 font-semibold"
				style={{ color: themeColors.textSecondary }}
			>
				Legend
			</Text>
			<View className="flex-row flex-wrap gap-4">
				<LegendItem color={themeColors.primary} label="Selected date" />
				<LegendItem color={themeColors.borderDefault} label="Day off" />
				<LegendItem
					color={themeColors.successAlt}
					label="Has orders / selected order day"
				/>
				<LegendItem
					color={themeColors.statusUnavailable}
					label="Overridden (unavailable)"
				/>
			</View>
		</View>
	);
}
