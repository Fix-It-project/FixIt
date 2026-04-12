import { CalendarClock, Check, X } from "lucide-react-native";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
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
		<View className="mt-2" style={{ gap: 10 }}>
			<TouchableOpacity
				onPress={onComplete}
				disabled={isCompleting}
				className="flex-row items-center justify-center gap-2 rounded-2xl py-4"
				style={{
					backgroundColor: isCompleting
						? themeColors.borderDefault
						: themeColors.primary,
				}}
				activeOpacity={0.85}
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
							style={{
								fontFamily: "GoogleSans_700Bold",
								fontSize: 15,
								color: themeColors.onPrimaryHeader,
							}}
						>
							Complete Booking
						</Text>
					</>
				)}
			</TouchableOpacity>

			<TouchableOpacity
				onPress={onReschedule}
				className="flex-row items-center justify-center gap-2 rounded-2xl border py-4"
				style={{
					borderColor: themeColors.borderDefault,
					backgroundColor: themeColors.surfaceBase,
				}}
				activeOpacity={0.7}
			>
				<CalendarClock
					size={18}
					color={themeColors.textPrimary}
					strokeWidth={2}
				/>
				<Text
					style={{
						fontFamily: "GoogleSans_600SemiBold",
						fontSize: 15,
						color: themeColors.textPrimary,
					}}
				>
					Reschedule
				</Text>
			</TouchableOpacity>

			<TouchableOpacity
				onPress={onCancel}
				className="flex-row items-center justify-center gap-2 rounded-2xl border py-4"
				style={{ borderColor: themeColors.danger }}
				activeOpacity={0.7}
			>
				<X size={18} color={themeColors.danger} strokeWidth={2} />
				<Text
					style={{
						fontFamily: "GoogleSans_600SemiBold",
						fontSize: 15,
						color: themeColors.danger,
					}}
				>
					Cancel Booking
				</Text>
			</TouchableOpacity>
		</View>
	);
}
