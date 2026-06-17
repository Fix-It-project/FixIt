import { router } from "expo-router";
import { ChevronRight, Clock } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { PressableScale } from "@/src/components/animation/pressable-scale";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/src/components/ui/avatar";
import { Icon } from "@/src/components/ui/icon";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/constants/design-tokens";
import type { Order } from "@/src/features/booking-orders/schemas/response.schema";
import {
	formatDate,
	formatTime,
	getAvatarColor,
} from "@/src/features/booking-orders/utils/booking-helpers";
import { getOrderStatusBadge } from "@/src/features/booking-orders/utils/order-status-ui";
import { translateServiceName } from "@/src/features/categories/constants/categories";
import { useDebounce } from "@/src/hooks/useDebounce";
import { getPfpInitialsFallback } from "@/src/lib/initials";
import { ROUTES } from "@/src/lib/navigation";

/**
 * One current booking in Activity → Bookings. Mirrors the technician
 * `ScheduledJobCard` look (avatar · name + status pill · service · time row ·
 * chevron). Whole card opens the order detail.
 */
export default function UserBookingCard({ order }: { readonly order: Order }) {
	const { t, i18n } = useTranslation("orders");
	const { t: tc } = useTranslation("categories");
	const themeColors = useThemeColors();
	const open = useDebounce(() =>
		router.push(ROUTES.user.orderDetail(order.id)),
	);

	const initials = getPfpInitialsFallback(order.technician_name);
	const avatarColor = getAvatarColor(order.technician_name);
	const status = getOrderStatusBadge(order.status, themeColors, "user", t);
	const scheduledTime = formatTime(order.scheduled_start_at, i18n.language);
	const technicianImage = order.technician_image?.trim() || null;
	const serviceName = translateServiceName(
		tc,
		order.service_id,
		order.service_name,
	);
	const timeLabel = [
		formatDate(order.scheduled_date, i18n.language),
		scheduledTime,
	]
		.filter(Boolean)
		.join(" · ");

	return (
		<PressableScale
			pressedScale={0.985}
			onPress={open}
			className="rounded-card bg-card p-card"
			accessibilityLabel={order.technician_name ?? t("card.technicianFallback")}
		>
			<View className="flex-row items-center gap-stack-md">
				<Avatar
					alt={order.technician_name ?? initials}
					className="h-control-icon-box-lg w-control-icon-box-lg items-center justify-center rounded-pill"
					style={{ backgroundColor: avatarColor }}
				>
					{technicianImage ? (
						<AvatarImage
							source={{ uri: technicianImage }}
							className="h-control-icon-box-lg w-control-icon-box-lg rounded-pill"
						/>
					) : null}
					<AvatarFallback className="bg-transparent">
						<Text
							variant="buttonLg"
							className="font-bold"
							style={{ color: themeColors.surfaceOnPrimary }}
						>
							{initials}
						</Text>
					</AvatarFallback>
				</Avatar>

				<View className="flex-1">
					<Text
						variant="label"
						className="font-bold text-content"
						numberOfLines={1}
					>
						{order.technician_name ?? t("card.technicianFallback")}
					</Text>

					<Text
						variant="caption"
						className="mt-0.5 text-content-secondary"
						numberOfLines={1}
					>
						{serviceName || t("card.serviceFallback")}
					</Text>

					<View
						className="mt-stack-xs self-start rounded-pill px-stack-sm py-0.5"
						style={{ backgroundColor: status.bg }}
					>
						<Text
							variant="caption"
							className="font-semibold"
							style={{ color: status.color }}
						>
							{status.label}
						</Text>
					</View>

					{timeLabel ? (
						<View className="mt-stack-xs flex-row items-center gap-1">
							<Icon as={Clock} size={13} className="text-content-muted" />
							<Text variant="caption" className="text-content-muted">
								{timeLabel}
							</Text>
						</View>
					) : null}
				</View>

				<Icon as={ChevronRight} size={18} className="text-content-muted" />
			</View>
		</PressableScale>
	);
}
