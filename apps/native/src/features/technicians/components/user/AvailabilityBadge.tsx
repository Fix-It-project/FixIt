import { CircleCheck, Clock } from "lucide-react-native";
import { View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { Colors, useThemeColors } from "@/src/lib/theme";

interface AvailabilityBadgeProps {
	readonly isAvailable: boolean;
}

export default function AvailabilityBadge({
	isAvailable,
}: AvailabilityBadgeProps) {
	const themeColors = useThemeColors();
	if (isAvailable) {
		return (
			<View
				className="flex-row items-center self-start rounded-full px-2 py-0.5"
				style={{ backgroundColor: Colors.statusAvailable, gap: 3 }}
			>
				<CircleCheck size={11} color={Colors.success} strokeWidth={2.5} />
				<Text
					className="font-semibold text-[10px] text-success"
					style={{ fontFamily: "GoogleSans_600SemiBold" }}
				>
					Available Now
				</Text>
			</View>
		);
	}

	return (
		<View
			className="flex-row items-center self-start rounded-full px-2 py-0.5"
			style={{ backgroundColor: themeColors.surfaceElevated, gap: 3 }}
		>
			<Clock size={11} color={themeColors.surfaceMuted} strokeWidth={2.5} />
			<Text
				className="font-semibold text-[10px] text-surface-muted"
				style={{ fontFamily: "GoogleSans_600SemiBold" }}
			>
				Unavailable
			</Text>
		</View>
	);
}
