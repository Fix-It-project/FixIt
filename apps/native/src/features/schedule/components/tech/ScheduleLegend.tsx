import { View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/lib/theme";

function LegendItem({
	color,
	label,
}: Readonly<{ color: string; label: string }>) {
	const themeColors = useThemeColors();
	return (
		<View className="flex-row items-center gap-stack-xs">
			<View
				className="h-status-dot-sm w-status-dot-sm rounded-pill"
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
		<View className="mt-stack-lg px-screen-x">
			<Text
				variant="bodySm"
				className="mb-stack-sm font-semibold"
				style={{ color: themeColors.textSecondary }}
			>
				Legend
			</Text>
			<View className="flex-row flex-wrap gap-stack-lg">
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
