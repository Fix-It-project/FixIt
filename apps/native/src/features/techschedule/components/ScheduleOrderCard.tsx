import { router } from "expo-router";
import { ChevronRight, Clock, Navigation, Receipt } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { PressableScale } from "@/src/components/animation/pressable-scale";
import { Icon } from "@/src/components/ui/icon";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/constants/design-tokens";
import { useDebounce } from "@/src/hooks/useDebounce";
import { getAvatarColor } from "@/src/lib/avatar";
import { getPfpInitialsFallback } from "@/src/lib/initials";
import { openCoordinatesInMaps } from "@/src/lib/maps/open-coordinates";
import { ROUTES } from "@/src/lib/navigation";
import type { TechnicianBooking } from "@/src/schemas/technician-order.schema";
import { formatEgp, formatKm, formatTimeFromIso } from "../utils/format";

/**
 * Booking card in the schedule day panel. Tapping the body opens the order;
 * tapping the avatar opens the customer's location in maps (lat/long only).
 */
export function ScheduleOrderCard({
	booking,
}: {
	readonly booking: TechnicianBooking;
}) {
	const themeColors = useThemeColors();
	const { t } = useTranslation("technician");
	const openDetail = useDebounce(() =>
		router.push(ROUTES.technician.bookingDetail(booking.id)),
	);
	const initials = getPfpInitialsFallback(booking.user_name);
	const avatarColor = getAvatarColor(booking.user_name);
	const time = formatTimeFromIso(booking.scheduled_start_at);
	const fee = formatEgp(booking.inspection_fee);
	const distance = formatKm(booking.inspection_distance_km);
	const hasCoords =
		booking.user_latitude != null && booking.user_longitude != null;

	return (
		<View className="flex-row items-center gap-stack-md rounded-card bg-card p-card">
			<Pressable
				onPress={() =>
					openCoordinatesInMaps(booking.user_latitude, booking.user_longitude)
				}
				disabled={!hasCoords}
				accessibilityLabel={t("schedule.orderCard.openLocationAria")}
				className="h-control-icon-box-lg w-control-icon-box-lg items-center justify-center rounded-pill"
				style={{ backgroundColor: avatarColor }}
			>
				<Text
					variant="buttonLg"
					className="font-bold"
					style={{ color: themeColors.surfaceOnPrimary }}
				>
					{initials}
				</Text>
			</Pressable>

			<PressableScale
				pressedScale={0.99}
				onPress={openDetail}
				className="flex-1 flex-row items-center gap-stack-sm"
				accessibilityLabel={t("schedule.orderCard.openBookingAria", {
					name: booking.user_name ?? t("schedule.orderCard.customerFallback"),
				})}
			>
				<View className="flex-1">
					<Text
						variant="label"
						className="font-bold text-content"
						numberOfLines={1}
					>
						{booking.user_name ?? t("schedule.orderCard.customerFallback")}
					</Text>
					<Text
						variant="caption"
						className="text-content-secondary"
						numberOfLines={1}
					>
						{booking.service_name ?? t("schedule.orderCard.serviceFallback")}
					</Text>
					<View className="mt-stack-xs flex-row flex-wrap items-center gap-x-stack-md gap-y-0.5">
						{time ? (
							<View className="flex-row items-center gap-1">
								<Icon as={Clock} size={12} className="text-content-muted" />
								<Text variant="caption" className="text-content-muted">
									{time}
								</Text>
							</View>
						) : null}
						{fee ? (
							<View className="flex-row items-center gap-1">
								<Icon as={Receipt} size={12} className="text-content-muted" />
								<Text variant="caption" className="text-content-muted">
									{fee}
								</Text>
							</View>
						) : null}
						{distance ? (
							<View className="flex-row items-center gap-1">
								<Icon
									as={Navigation}
									size={12}
									className="text-content-muted"
								/>
								<Text variant="caption" className="text-content-muted">
									{distance}
								</Text>
							</View>
						) : null}
					</View>
				</View>
				<Icon as={ChevronRight} size={18} className="text-content-muted" />
			</PressableScale>
		</View>
	);
}
