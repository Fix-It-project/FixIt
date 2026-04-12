import { ClipboardList, type LucideIcon } from "lucide-react-native";
import { Image, View } from "react-native";
import { Text } from "@/src/components/ui/text";
import type { Order } from "@/src/features/booking-orders/schemas/response.schema";
import { CATEGORIES } from "@/src/lib/helpers/categories";
import { getAvatarColor, getInitials } from "@/src/lib/helpers/booking-helpers";
import { Colors, useThemeColors } from "@/src/lib/theme";

interface Props {
	readonly order: Order;
}

export default function OrderTechnicianCard({ order }: Props) {
	const themeColors = useThemeColors();
	const category = order.category_id
		? CATEGORIES.find((c) => c.id === order.category_id)
		: undefined;
	const CategoryIcon: LucideIcon = category?.icon ?? ClipboardList;
	const categoryColor = category?.color ?? Colors.primary;
	const initials = getInitials(order.technician_name);
	const avatarColor = getAvatarColor(order.technician_name);

	return (
		<View
			className="mb-4 rounded-2xl bg-surface p-5"
			style={{ borderWidth: 1, borderColor: themeColors.borderDefault }}
		>
			<View className="flex-row items-center gap-4">
				{order.technician_image ? (
					<Image
						source={{ uri: order.technician_image }}
						className="h-16 w-16 rounded-full"
						style={{ backgroundColor: themeColors.surfaceElevated }}
					/>
				) : (
					<View
						className="h-16 w-16 items-center justify-center rounded-full"
						style={{ backgroundColor: avatarColor }}
					>
						<Text
							style={{
								fontFamily: "GoogleSans_700Bold",
								fontSize: 20,
								color: themeColors.surfaceBase,
							}}
						>
							{initials}
						</Text>
					</View>
				)}
				<View className="flex-1">
					<Text
						style={{
							fontFamily: "GoogleSans_700Bold",
							fontSize: 18,
							color: themeColors.textPrimary,
						}}
						numberOfLines={1}
					>
						{order.technician_name ?? "Technician"}
					</Text>
					<View className="mt-1 flex-row items-center gap-1.5">
						<CategoryIcon size={14} color={categoryColor} strokeWidth={2} />
						<Text style={{ fontSize: 13, color: themeColors.textSecondary }}>
							{order.service_name ?? "Service"}
						</Text>
					</View>
				</View>
			</View>
		</View>
	);
}
