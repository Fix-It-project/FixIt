import { ClipboardList, type LucideIcon } from "lucide-react-native";
import { Image, View, useWindowDimensions } from "react-native";
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
	const { width } = useWindowDimensions();
	const category = order.category_id
		? CATEGORIES.find((c) => c.id === order.category_id)
		: undefined;
	const CategoryIcon: LucideIcon = category?.icon ?? ClipboardList;
	const categoryColor = category?.color ?? Colors.primary;
	const initials = getInitials(order.technician_name);
	const avatarColor = getAvatarColor(order.technician_name);
	const avatarSize = width < 360 ? 52 : 64;
	const nameFontSize = width < 360 ? 16 : 18;

	return (
		<View
			className="mb-4 rounded-2xl bg-surface p-5"
			style={{ borderWidth: 1, borderColor: themeColors.borderDefault }}
		>
			<View className="flex-row gap-4" style={{ alignItems: "center" }}>
				{order.technician_image ? (
					<Image
						source={{ uri: order.technician_image }}
						style={{
							width: avatarSize,
							height: avatarSize,
							borderRadius: avatarSize / 2,
							backgroundColor: themeColors.surfaceElevated,
						}}
					/>
				) : (
					<View
						className="items-center justify-center rounded-full"
						style={{
							width: avatarSize,
							height: avatarSize,
							backgroundColor: avatarColor,
						}}
					>
						<Text
							style={{
								fontFamily: "GoogleSans_700Bold",
								fontSize: avatarSize * 0.32,
								color: themeColors.surfaceBase,
							}}
						>
							{initials}
						</Text>
					</View>
				)}
				<View style={{ flex: 1, minWidth: 0 }}>
					<Text
						style={{
							fontFamily: "GoogleSans_700Bold",
							fontSize: nameFontSize,
							color: themeColors.textPrimary,
						}}
						numberOfLines={2}
					>
						{order.technician_name ?? "Technician"}
					</Text>
					<View className="mt-1 flex-row items-center gap-1.5" style={{ minWidth: 0 }}>
						<CategoryIcon size={14} color={categoryColor} strokeWidth={2} />
						<Text
							style={{ flex: 1, fontSize: 13, color: themeColors.textSecondary }}
							numberOfLines={2}
						>
							{order.service_name ?? "Service"}
						</Text>
					</View>
				</View>
			</View>
		</View>
	);
}
