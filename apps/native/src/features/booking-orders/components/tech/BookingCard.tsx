import { router } from "expo-router";
import { Calendar, ClipboardList, type LucideIcon } from "lucide-react-native";
import { TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Text } from "@/src/components/ui/text";
import {
	formatDate,
	formatTime,
	getAvatarColor,
} from "@/src/features/booking-orders/utils/booking-helpers";
import { getOrderStatusBadge } from "@/src/lib/order-status";
import { useDebounce } from "@/src/hooks/useDebounce";
import { elevation, shadowStyle } from "@/src/lib/design-tokens";
import { CATEGORIES } from "@/src/lib/helpers/categories";
import { getPfpInitialsFallback } from "@/src/lib/helpers/pfp-initials-fallback";
import { ROUTES } from "@/src/lib/routes";
import { spacing, useThemeColors } from "@/src/lib/theme";
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
	const status =
		isCancelled || isCompleted
			? getOrderStatusBadge(booking.status, themeColors, "technician")
			: null;
	const scheduledTime = formatTime(booking.scheduled_start_at);

	return (
		<Animated.View
			entering={FadeInDown.delay(index * 100).duration(400)}
			className="mb-stack-md"
		>
			<View
				className="overflow-hidden rounded-card border bg-surface"
				style={{
					borderColor: isCancelled
						? `${themeColors.danger}30`
						: themeColors.borderDefault,
					opacity: isCancelled ? 0.7 : 1,
					...shadowStyle(elevation.raised, { shadowColor: themeColors.shadow }),
				}}
			>
				<TouchableOpacity activeOpacity={0.85} onPress={goToBooking}>
					<View className="flex-row items-center gap-stack-md p-card">
						{/* Avatar */}
						<View
							className="h-control-icon-box-lg w-control-icon-box-lg items-center justify-center rounded-pill"
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

							<View className="mt-stack-xs flex-row items-center gap-stack-xs">
								<CategoryIcon size={spacing.icon.caption} color={categoryColor} strokeWidth={2} />
								<Text
									variant="caption"
									style={{ color: themeColors.textSecondary }}
									numberOfLines={1}
								>
									{booking.service_name ?? "Service"}
								</Text>
							</View>

							<View className="mt-stack-xs flex-row items-center gap-stack-xs">
								<Calendar
									size={spacing.icon.caption}
									color={themeColors.textMuted}
									strokeWidth={2}
								/>
								<Text
									variant="caption"
									style={{ color: themeColors.textMuted }}
								>
									{formatDate(booking.scheduled_date)}
									{scheduledTime ? ` • ${scheduledTime}` : ""}
								</Text>
							</View>

							{/* Status badge */}
							{status && (
								<View
									className="mt-stack-xs self-start rounded-pill px-stack-md py-stack-xs"
									style={{ backgroundColor: `${status.color}15` }}
								>
									<Text
										variant="caption"
										className="font-semibold"
										style={{ color: status.color }}
									>
										{status.label}
									</Text>
								</View>
							)}
						</View>

						{/* Category badge */}
						<View
							className="h-control-icon-box-md w-control-icon-box-md items-center justify-center rounded-button"
							style={{ backgroundColor: `${categoryColor}18` }}
						>
							<CategoryIcon size={spacing.icon.sm} color={categoryColor} strokeWidth={1.8} />
						</View>
					</View>
				</TouchableOpacity>
			</View>
		</Animated.View>
	);
}
