import { CalendarDays } from "lucide-react-native";
import { TouchableOpacity } from "react-native";
import { Text } from "@/src/components/ui/text";
import {
	elevation,
	shadowStyle,
	spacing,
	type ThemePalette,
} from "@/src/lib/theme";

interface Props {
	readonly onPress: () => void;
	readonly themeColors: ThemePalette;
}

export default function BookingsCalendarTrigger({
	onPress,
	themeColors,
}: Props) {
	return (
		<TouchableOpacity
			onPress={onPress}
			className="flex-row items-center gap-control-trigger self-end rounded-button px-control-trigger-x py-control-trigger-y"
			style={{
				backgroundColor: themeColors.primaryLight,
				...shadowStyle(elevation.flat, {
					shadowColor: themeColors.shadow,
					opacity: 0.08,
				}),
			}}
			activeOpacity={0.7}
		>
			<CalendarDays
				size={spacing.icon.xs}
				color={themeColors.primary}
				strokeWidth={2}
			/>
			<Text variant="caption" className="font-semibold text-app-primary">
				Jump
			</Text>
		</TouchableOpacity>
	);
}
