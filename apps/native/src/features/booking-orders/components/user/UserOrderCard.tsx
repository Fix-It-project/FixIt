import { ClipboardList, type LucideIcon } from "lucide-react-native";
import { Image, TouchableOpacity, View } from "react-native";
import { Text } from "@/src/components/ui/text";
import type { Order } from "@/src/features/booking-orders/schemas/response.schema";
import {
	formatDate,
	getAvatarColor,
} from "@/src/features/booking-orders/utils/booking-helpers";
import { CATEGORIES } from "@/src/lib/helpers/categories";
import { getPfpInitialsFallback } from "@/src/lib/helpers/pfp-initials-fallback";
import { Colors, useThemeColors } from "@/src/lib/theme";
import type { OrderStatus } from "@/src/schemas/shared.schema";

const STATUS_CONFIG: Record<
	OrderStatus,
	{ label: string; color: string; bg: string }
> = {
	pending: { label: "Pending", color: Colors.warning, bg: Colors.warningLight },
	accepted: {
		label: "Accepted",
		color: Colors.success,
		bg: Colors.statusAvailable,
	},
	rejected: { label: "Rejected", color: Colors.danger, bg: Colors.dangerSoft },
	cancelled_by_user: {
		label: "Cancelled",
		color: Colors.danger,
		bg: Colors.dangerSoft,
	},
	cancelled_by_technician: {
		label: "Cancelled by tech",
		color: Colors.danger,
		bg: Colors.dangerSoft,
	},
	completed: {
		label: "Completed",
		color: Colors.success,
		bg: Colors.statusAvailable,
	},
};

interface Props {
	readonly order: Order;
	readonly onPress: () => void;
}

export default function UserOrderCard({ order, onPress }: Props) {
	const themeColors = useThemeColors();
	const category = order.category_id
		? CATEGORIES.find((c) => c.id === order.category_id)
		: undefined;
	const CategoryIcon: LucideIcon = category?.icon ?? ClipboardList;
	const categoryColor = category?.color ?? Colors.primary;
	const initials = getPfpInitialsFallback(order.technician_name);
	const avatarColor = getAvatarColor(order.technician_name);
	const status = STATUS_CONFIG[order.status];

	return (
		<TouchableOpacity
			onPress={onPress}
			activeOpacity={0.7}
			className="mb-3 rounded-card bg-surface p-card"
			style={{ borderWidth: 1, borderColor: themeColors.borderDefault }}
		>
			<View className="flex-row items-center gap-3">
				{/* Avatar */}
				{order.technician_image ? (
					<Image
						source={{ uri: order.technician_image }}
						className="h-control-icon-box-lg w-control-icon-box-lg rounded-full"
						style={{ backgroundColor: themeColors.surfaceElevated }}
					/>
				) : (
					<View
						className="h-control-icon-box-lg w-control-icon-box-lg items-center justify-center rounded-full"
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
					<View className="mt-0.5 flex-row items-center gap-1.5">
						<CategoryIcon size={13} color={categoryColor} strokeWidth={2} />
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
					className="rounded-full px-2.5 py-1"
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

			{/* Date row */}
			<View
				className="mt-3 flex-row items-center justify-between border-t pt-3"
				style={{ borderColor: themeColors.borderDefault }}
			>
				<Text variant="caption" style={{ color: themeColors.textMuted }}>
					{formatDate(order.scheduled_date)}
				</Text>
				<Text
					variant="caption"
					className="font-semibold"
					style={{ color: Colors.primary }}
				>
					View Details
				</Text>
			</View>
		</TouchableOpacity>
	);
}
