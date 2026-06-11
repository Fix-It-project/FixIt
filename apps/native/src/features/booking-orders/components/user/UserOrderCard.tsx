import { Image } from "expo-image";
import { ClipboardList, type LucideIcon } from "lucide-react-native";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { Colors, spacing, useThemeColors } from "@/src/constants/design-tokens";
import type { Order } from "@/src/features/booking-orders/schemas/response.schema";
import {
	formatDate,
	formatTime,
	getAvatarColor,
} from "@/src/features/booking-orders/utils/booking-helpers";
import { getOrderStatusBadge } from "@/src/features/booking-orders/utils/order-status-ui";
import {
	CATEGORIES,
	translateServiceName,
} from "@/src/features/categories/constants/categories";
import { getPfpInitialsFallback } from "@/src/lib/initials";

interface Props {
	readonly order: Order;
	readonly onPress: () => void;
	readonly actionSlot?: ReactNode;
}

export default function UserOrderCard({ order, onPress, actionSlot }: Props) {
	const { t, i18n } = useTranslation("orders");
	const { t: tc } = useTranslation("categories");
	const themeColors = useThemeColors();
	const category = order.category_id
		? CATEGORIES.find((c) => c.id === order.category_id)
		: undefined;
	const CategoryIcon: LucideIcon = category?.icon ?? ClipboardList;
	const categoryColor = Colors.primary;
	const initials = getPfpInitialsFallback(order.technician_name);
	const avatarColor = getAvatarColor(order.technician_name);
	const status = getOrderStatusBadge(order.status, themeColors, "user", t);
	const scheduledTime = formatTime(order.scheduled_start_at, i18n.language);
	const serviceName = translateServiceName(
		tc,
		order.service_id,
		order.service_name,
	);

	return (
		<TouchableOpacity
			onPress={onPress}
			activeOpacity={0.7}
			testID="order-card"
			className="mb-stack-md rounded-card bg-card p-card"
		>
			<View className="flex-row items-center gap-stack-md">
				{/* Avatar */}
				{order.technician_image ? (
					<Image
						source={{ uri: order.technician_image }}
						className="h-control-icon-box-lg w-control-icon-box-lg rounded-pill"
						contentFit="cover"
						style={{ backgroundColor: themeColors.surfaceElevated }}
					/>
				) : (
					<View
						className="h-control-icon-box-lg w-control-icon-box-lg items-center justify-center rounded-pill"
						style={{ backgroundColor: avatarColor }}
					>
						<Text
							variant="buttonLg"
							style={{ color: themeColors.surfaceOnPrimary }}
						>
							{initials}
						</Text>
					</View>
				)}

				{/* Info */}
				<View className="flex-1">
					<Text
						variant="buttonLg"
						style={{ color: themeColors.textPrimary }}
						numberOfLines={1}
					>
						{order.technician_name ?? t("card.technicianFallback")}
					</Text>
					<View className="mt-stack-xs flex-row items-center gap-stack-xs">
						<CategoryIcon
							size={spacing.icon.caption}
							color={categoryColor}
							strokeWidth={2}
						/>
						<Text
							variant="caption"
							style={{ color: themeColors.textSecondary }}
							numberOfLines={1}
						>
							{serviceName || t("card.serviceFallback")}
						</Text>
					</View>
				</View>

				{/* Status badge */}
				<View
					className="rounded-pill px-stack-md py-stack-xs"
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
			</View>

			{/* Date + actions */}
			<View className="mt-stack-md border-edge border-t pt-stack-md">
				<View className="min-w-0">
					<Text variant="caption" style={{ color: themeColors.textMuted }}>
						{formatDate(order.scheduled_date, i18n.language)}
					</Text>
					{scheduledTime ? (
						<Text
							variant="caption"
							className="mt-stack-xs"
							style={{ color: themeColors.textMuted }}
						>
							{scheduledTime}
						</Text>
					) : null}
				</View>

				<View className="mt-stack-md flex-row flex-wrap items-center justify-end gap-stack-sm">
					{actionSlot}
					<Text
						variant="caption"
						className="font-semibold"
						style={{ color: Colors.primary }}
					>
						{t("card.viewDetails")}
					</Text>
				</View>
			</View>
		</TouchableOpacity>
	);
}
