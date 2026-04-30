import { ClipboardList, type LucideIcon } from "lucide-react-native";
import { Image, useWindowDimensions, View } from "react-native";
import { Text } from "@/src/components/ui/text";
import type { Order } from "@/src/features/booking-orders/schemas/response.schema";
import { getAvatarColor } from "@/src/features/booking-orders/utils/booking-helpers";
import { CATEGORIES } from "@/src/lib/helpers/categories";
import { getPfpInitialsFallback } from "@/src/lib/helpers/pfp-initials-fallback";
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
	const initials = getPfpInitialsFallback(order.technician_name);
	const avatarColor = getAvatarColor(order.technician_name);
	const avatarSize = width < 360 ? 52 : 64;
	const nameFontSize = width < 360 ? 16 : 18;

	return (
		<View className="mb-stack-lg rounded-card border border-edge bg-surface p-card-roomy">
			<View className="flex-row gap-stack-lg" style={{ alignItems: "center" }}>
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
						className="items-center justify-center rounded-pill"
						style={{
							width: avatarSize,
							height: avatarSize,
							backgroundColor: avatarColor,
						}}
					>
						<Text
							variant="body"
							className="font-bold"
							style={{
								fontSize: avatarSize * 0.32,
								color: themeColors.surfaceBase,
							}}
						>
							{initials}
						</Text>
					</View>
				)}
				<View className="min-w-0 flex-1">
					<Text
						variant="body"
						className="font-bold"
						style={{
							fontSize: nameFontSize,
							color: themeColors.textPrimary,
						}}
						numberOfLines={2}
					>
						{order.technician_name ?? "Technician"}
					</Text>
					<View className="mt-stack-xs min-w-0 flex-row items-center gap-stack-xs">
						<CategoryIcon size={14} color={categoryColor} strokeWidth={2} />
						<Text
							variant="bodySm"
							style={{ flex: 1, color: themeColors.textSecondary }}
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
