import { ClipboardList, type LucideIcon } from "lucide-react-native";
import { Image, TouchableOpacity, View } from "react-native";
import { Text } from "@/src/components/ui/text";
import type { Order } from "@/src/features/booking-orders/schemas/response.schema";
import { CATEGORIES } from "@/src/lib/helpers/categories";
import { Colors } from "@/src/lib/theme";
import {
	formatDate,
	getAvatarColor,
	getInitials,
} from "@/src/lib/helpers/booking-helpers";
import { useThemeColors } from "@/src/lib/theme";
import type { OrderStatus } from "@/src/schemas/shared.schema";

const STATUS_CONFIG: Record<
	OrderStatus,
	{ label: string; color: string; bg: string }
> = {
	pending: { label: "Pending", color: Colors.warning, bg: Colors.warningLight },
	accepted: { label: "Accepted", color: Colors.success, bg: "#d1fae5" },
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
	completed: { label: "Completed", color: Colors.success, bg: "#d1fae5" },
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
	const initials = getInitials(order.technician_name);
	const avatarColor = getAvatarColor(order.technician_name);
	const status = STATUS_CONFIG[order.status];

	return (
		<TouchableOpacity
			onPress={onPress}
			activeOpacity={0.7}
			className="mb-3 rounded-2xl bg-surface p-4"
			style={{ borderWidth: 1, borderColor: themeColors.borderDefault }}
		>
			<View className="flex-row items-center gap-3">
				{/* Avatar */}
				{order.technician_image ? (
					<Image
						source={{ uri: order.technician_image }}
						className="h-12 w-12 rounded-full"
						style={{ backgroundColor: themeColors.surfaceElevated }}
					/>
				) : (
					<View
						className="h-12 w-12 items-center justify-center rounded-full"
						style={{ backgroundColor: avatarColor }}
					>
						<Text
							style={{
								fontFamily: "GoogleSans_700Bold",
								fontSize: 16,
								color: themeColors.surfaceBase,
							}}
						>
							{initials}
						</Text>
					</View>
				)}

				{/* Info */}
				<View className="flex-1">
					<Text
						style={{
							fontFamily: "GoogleSans_600SemiBold",
							fontSize: 15,
							color: themeColors.textPrimary,
						}}
						numberOfLines={1}
					>
						{order.technician_name ?? "Technician"}
					</Text>
					<View className="mt-0.5 flex-row items-center gap-1.5">
						<CategoryIcon size={13} color={categoryColor} strokeWidth={2} />
						<Text
							style={{ fontSize: 12, color: themeColors.textSecondary }}
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
						style={{
							fontSize: 11,
							fontFamily: "GoogleSans_600SemiBold",
							color: status.color,
						}}
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
				<Text style={{ fontSize: 12, color: themeColors.textMuted }}>
					{formatDate(order.scheduled_date)}
				</Text>
				<Text
					style={{
						fontSize: 12,
						color: Colors.primary,
						fontFamily: "GoogleSans_600SemiBold",
					}}
				>
					View Details
				</Text>
			</View>
		</TouchableOpacity>
	);
}
