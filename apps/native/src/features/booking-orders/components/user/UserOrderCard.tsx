import { Image } from "expo-image";
import { ClipboardList, type LucideIcon } from "lucide-react-native";
import type { ReactNode } from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "@/src/components/ui/text";
import type { Order } from "@/src/features/booking-orders/schemas/response.schema";
import {
	formatDate,
	formatTime,
	getAvatarColor,
} from "@/src/features/booking-orders/utils/booking-helpers";
import { getOrderStatusBadge } from "@/src/features/booking-orders/utils/order-status-ui";
import { CATEGORIES } from "@/src/features/categories/constants/categories";
import { getPfpInitialsFallback } from "@/src/lib/initials";
import { Colors, spacing, useThemeColors } from "@/src/constants/design-tokens";

interface Props {
	readonly order: Order;
	readonly onPress: () => void;
	readonly actionSlot?: ReactNode;
}

export default function UserOrderCard({ order, onPress, actionSlot }: Props) {
	const themeColors = useThemeColors();
	const category = order.category_id
		? CATEGORIES.find((c) => c.id === order.category_id)
		: undefined;
	const CategoryIcon: LucideIcon = category?.icon ?? ClipboardList;
	const categoryColor = category?.color ?? Colors.primary;
	const initials = getPfpInitialsFallback(order.technician_name);
	const avatarColor = getAvatarColor(order.technician_name);
	const status = getOrderStatusBadge(order.status, themeColors, "user");
	const scheduledTime = formatTime(order.scheduled_start_at);

	return (
		<TouchableOpacity
			onPress={onPress}
			activeOpacity={0.7}
			className="mb-stack-md rounded-card border border-edge bg-surface p-card"
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
						<Text variant="buttonLg" style={{ color: themeColors.surfaceBase }}>
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
						{order.technician_name ?? "Technician"}
					</Text>
					<View className="mt-stack-xs flex-row items-center gap-stack-xs">
						<CategoryIcon size={spacing.icon.caption} color={categoryColor} strokeWidth={2} />
						<Text
							variant="caption"
							style={{ color: themeColors.textSecondary }}
							numberOfLines={1}
						>
							{order.service_name ?? "Service"}
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
						{formatDate(order.scheduled_date)}
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
						View Details
					</Text>
				</View>
			</View>
		</TouchableOpacity>
	);
}
