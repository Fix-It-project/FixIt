import { CalendarClock, Check, X } from "lucide-react-native";
import { ActivityIndicator, View } from "react-native";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/lib/theme";

interface Props {
	readonly onComplete: () => void;
	readonly onReschedule: () => void;
	readonly onCancel: () => void;
	readonly isCompleting: boolean;
}

export default function BookingActionButtons({
	onComplete,
	onReschedule,
	onCancel,
	isCompleting,
}: Props) {
	const themeColors = useThemeColors();
	return (
		<View className="mt-stack-sm gap-card-compact">
			<Button
				onPress={onComplete}
				disabled={isCompleting}
				size="action"
				className="w-full"
				style={{
					backgroundColor: isCompleting
						? themeColors.borderDefault
						: themeColors.primary,
				}}
			>
				{isCompleting ? (
					<ActivityIndicator size="small" color={themeColors.onPrimaryHeader} />
				) : (
					<>
						<Check
							size={18}
							color={themeColors.onPrimaryHeader}
							strokeWidth={2.5}
						/>
						<Text
							variant="buttonLg"
							className="font-bold"
							style={{ color: themeColors.onPrimaryHeader }}
						>
							Complete Booking
						</Text>
					</>
				)}
			</Button>

			<Button
				onPress={onReschedule}
				variant="secondary"
				size="action"
				className="w-full"
				style={{
					borderColor: themeColors.borderDefault,
					backgroundColor: themeColors.surfaceBase,
				}}
			>
				<CalendarClock
					size={18}
					color={themeColors.textPrimary}
					strokeWidth={2}
				/>
				<Text variant="buttonLg" style={{ color: themeColors.textPrimary }}>
					Reschedule
				</Text>
			</Button>

			<Button
				onPress={onCancel}
				variant="secondary"
				size="action"
				className="w-full"
				style={{ borderColor: themeColors.danger }}
				textClass="text-danger"
			>
				<X size={18} color={themeColors.danger} strokeWidth={2} />
				<Text variant="buttonLg" style={{ color: themeColors.danger }}>
					Cancel Booking
				</Text>
			</Button>
		</View>
	);
}
