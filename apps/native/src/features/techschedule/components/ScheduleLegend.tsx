import { View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/constants/design-tokens";

function DotChip({ color, label }: { readonly color: string; readonly label: string }) {
	const themeColors = useThemeColors();
	return (
		<View className="flex-row items-center gap-1">
			<View
				style={{
					width: 6,
					height: 6,
					borderRadius: 999,
					backgroundColor: color,
				}}
			/>
			<Text variant="caption" style={{ color: themeColors.textMuted }}>
				{label}
			</Text>
		</View>
	);
}

/** Tiny legend strip sitting just above the month calendar. */
export function ScheduleLegend() {
	const themeColors = useThemeColors();
	return (
		<View className="flex-row flex-wrap items-center gap-x-stack-md gap-y-stack-xs px-stack-xs pb-stack-sm">
			<DotChip color={themeColors.success} label="Bookings" />
			<DotChip color={themeColors.primary} label="Selected" />
			<View className="flex-row items-center gap-1">
				<View className="h-3 w-3 items-center justify-center">
					<View
						pointerEvents="none"
						style={{
							width: 12,
							height: 1.5,
							backgroundColor: themeColors.textMuted,
							transform: [{ rotate: "-45deg" }],
						}}
					/>
				</View>
				<Text variant="caption" style={{ color: themeColors.textMuted }}>
					Unavailable
				</Text>
			</View>
		</View>
	);
}
