import { CalendarClock, X } from "lucide-react-native";
import { View } from "react-native";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import { Colors, useThemeColors } from "@/src/lib/theme";

interface Props {
	readonly onReschedule: () => void;
	readonly onCancel: () => void;
}

export default function OrderActionButtons({ onReschedule, onCancel }: Props) {
	const themeColors = useThemeColors();
	return (
		<View className="mt-stack-sm gap-card-compact">
			<Button
				onPress={onReschedule}
				size="action"
				className="w-full"
				style={{ backgroundColor: Colors.primary }}
			>
				<CalendarClock
					size={18}
					color={themeColors.surfaceBase}
					strokeWidth={2}
				/>
				<Text variant="buttonLg" style={{ color: themeColors.surfaceBase }}>
					Reschedule
				</Text>
			</Button>

			<Button
				onPress={onCancel}
				variant="secondary"
				size="action"
				className="w-full"
				style={{ borderColor: Colors.danger }}
				textClass="text-danger"
			>
				<X size={18} color={Colors.danger} strokeWidth={2} />
				<Text variant="buttonLg" style={{ color: Colors.danger }}>
					Cancel Order
				</Text>
			</Button>
		</View>
	);
}
