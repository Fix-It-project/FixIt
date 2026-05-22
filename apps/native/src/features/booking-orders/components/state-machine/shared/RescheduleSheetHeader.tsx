// Header row for RescheduleSheet: icon badge + title + close button.

import { CalendarClock, X } from "lucide-react-native";
import { View } from "react-native";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import { radius, space, spacing, useThemeColors } from "@/src/lib/theme";

interface RescheduleSheetHeaderProps {
	readonly onClose: () => void;
	readonly disabled: boolean;
}

export default function RescheduleSheetHeader({
	onClose,
	disabled,
}: RescheduleSheetHeaderProps) {
	const themeColors = useThemeColors();

	return (
		<View
			style={{
				flexDirection: "row",
				alignItems: "center",
				gap: space[3],
				marginBottom: space[4],
			}}
		>
			<View
				style={{
					width: 42,
					height: 42,
					borderRadius: radius.pill,
					alignItems: "center",
					justifyContent: "center",
					backgroundColor: `${themeColors.primary}1A`,
				}}
			>
				<CalendarClock
					size={spacing.icon.sm}
					color={themeColors.primary}
					strokeWidth={2.4}
				/>
			</View>
			<View style={{ flex: 1 }}>
				<Text
					variant="buttonLg"
					className="font-google-sans-bold"
					style={{ color: themeColors.textPrimary }}
				>
					Reschedule order
				</Text>
				<Text variant="caption" style={{ color: themeColors.textMuted }}>
					Pick a new date and add a short note.
				</Text>
			</View>
			<Button variant="ghost" size="icon" onPress={onClose} disabled={disabled}>
				<X
					size={spacing.icon.sm}
					color={themeColors.textSecondary}
					strokeWidth={2.4}
				/>
			</Button>
		</View>
	);
}
