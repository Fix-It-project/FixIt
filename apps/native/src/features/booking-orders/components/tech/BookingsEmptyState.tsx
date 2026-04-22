import { CalendarOff } from "lucide-react-native";
import { View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/lib/theme";

/** Shown when the selected day has no bookings. */
export default function BookingsEmptyState() {
	const themeColors = useThemeColors();
	return (
		<Animated.View
			entering={FadeIn.duration(400)}
			className="items-center justify-center px-6 py-16"
		>
			{/* Icon */}
			<View
				className="mb-5 h-20 w-20 items-center justify-center rounded-full"
				style={{ backgroundColor: themeColors.primaryLight }}
			>
				<CalendarOff size={36} color={themeColors.primary} strokeWidth={1.5} />
			</View>

			<Text
				variant="h3"
				style={{ color: themeColors.textPrimary, textAlign: "center" }}
			>
				All clear for today
			</Text>
			<Text
				variant="bodySm"
				className="mt-2"
				style={{ color: themeColors.textSecondary, textAlign: "center" }}
			>
				No bookings scheduled. Enjoy your free time{"\n"}or check another day!
			</Text>
		</Animated.View>
	);
}
