import { router } from "expo-router";
import { Calendar, ClipboardList, type LucideIcon } from "lucide-react-native";
import { TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Text } from "@/src/components/ui/text";
import {
	formatDate,
	getAvatarColor,
} from "@/src/features/booking-orders/utils/booking-helpers";
import { useDebounce } from "@/src/hooks/useDebounce";
import { elevation, shadowStyle } from "@/src/lib/design-tokens";
import { CATEGORIES } from "@/src/lib/helpers/categories";
import { getPfpInitialsFallback } from "@/src/lib/helpers/pfp-initials-fallback";
import { ROUTES } from "@/src/lib/routes";
import { useThemeColors } from "@/src/lib/theme";
import type { TechnicianBooking } from "../../schemas/response.schema";

interface BookingCardProps {
	readonly booking: TechnicianBooking;
	readonly index: number;
}

export default function BookingCard({ booking, index }: BookingCardProps) {
	const themeColors = useThemeColors();
	const goToBooking = useDebounce(() =>
		router.push(ROUTES.technician.bookingDetail(booking.id)),
	);
	const category = CATEGORIES.find((c) => c.id === booking.category_id);
	const CategoryIcon: LucideIcon = category?.icon ?? ClipboardList;
	const categoryColor = category?.color ?? themeColors.primary;
	const initials = getPfpInitialsFallback(booking.user_name);
	const avatarColor = getAvatarColor(booking.user_name);
	const isCancelled =
		booking.status === "cancelled_by_user" ||
		booking.status === "cancelled_by_technician";
	const isCompleted = booking.status === "completed";
	let statusLabel: string | null = null;
	let statusColor: string | null = null;

	if (isCancelled) {
		statusLabel =
			booking.status === "cancelled_by_user"
				? "Cancelled by client"
				: "Cancelled";
		statusColor = themeColors.danger;
	} else if (isCompleted) {
		statusLabel = "Completed";
		statusColor = themeColors.success;
	}

	return (
		<Animated.View
			entering={FadeInDown.delay(index * 100).duration(400)}
			className="mb-3"
		>
			<View
				className="overflow-hidden rounded-card bg-surface"
				style={{
					borderWidth: 1,
					borderColor: isCancelled
						? `${themeColors.danger}30`
						: themeColors.borderDefault,
					opacity: isCancelled ? 0.7 : 1,
					...shadowStyle(elevation.raised, { shadowColor: themeColors.shadow }),
				}}
			>
				<TouchableOpacity activeOpacity={0.85} onPress={goToBooking}>
					<View className="flex-row items-center gap-3 p-card">
						{/* Avatar */}
						<View
							className="h-control-icon-box-lg w-control-icon-box-lg items-center justify-center rounded-full"
							style={{ backgroundColor: avatarColor }}
						>
							<Text
								variant="buttonLg"
								className="font-bold"
								style={{ color: themeColors.surfaceBase }}
							>
								{initials}
							</Text>
						</View>

						{/* Info */}
						<View className="flex-1">
							<Text
								variant="label"
								className="font-bold"
								style={{ color: themeColors.textPrimary }}
								numberOfLines={1}
							>
								{booking.user_name ?? "Unknown Client"}
							</Text>

							<View className="mt-0.5 flex-row items-center gap-1.5">
								<CategoryIcon size={12} color={categoryColor} strokeWidth={2} />
								<Text
									variant="caption"
									style={{ color: themeColors.textSecondary }}
									numberOfLines={1}
								>
									{booking.service_name ?? "Service"}
								</Text>
							</View>

							<View className="mt-1 flex-row items-center gap-1">
								<Calendar
									size={11}
									color={themeColors.textMuted}
									strokeWidth={2}
								/>
								<Text
									variant="caption"
									style={{ color: themeColors.textMuted }}
								>
									{formatDate(booking.scheduled_date)}
								</Text>
							</View>

							{/* Status badge */}
							{statusLabel && statusColor && (
								<View
									className="mt-1.5 self-start rounded-full px-2.5 py-0.5"
									style={{ backgroundColor: `${statusColor}15` }}
								>
									<Text
										variant="caption"
										className="font-semibold"
										style={{ color: statusColor }}
									>
										{statusLabel}
									</Text>
								</View>
							)}
						</View>

						{/* Category badge */}
						<View
							className="h-control-icon-box-md w-control-icon-box-md items-center justify-center rounded-button"
							style={{ backgroundColor: `${categoryColor}18` }}
						>
							<CategoryIcon size={18} color={categoryColor} strokeWidth={1.8} />
						</View>
					</View>
				</TouchableOpacity>
			</View>
		</Animated.View>
	);
}
