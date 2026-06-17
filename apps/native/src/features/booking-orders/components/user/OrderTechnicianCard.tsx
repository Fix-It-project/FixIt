import { ClipboardList, type LucideIcon } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useWindowDimensions, View } from "react-native";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/src/components/ui/avatar";
import { Text } from "@/src/components/ui/text";
import { Colors, spacing, useThemeColors } from "@/src/constants/design-tokens";
import type { Order } from "@/src/features/booking-orders/schemas/response.schema";
import { getAvatarColor } from "@/src/features/booking-orders/utils/booking-helpers";
import {
	CATEGORIES,
	translateServiceName,
} from "@/src/features/categories/constants/categories";
import { getPfpInitialsFallback } from "@/src/lib/initials";

interface Props {
	readonly order: Order;
}

export default function OrderTechnicianCard({ order }: Props) {
	const { t } = useTranslation("orders");
	const { t: tc } = useTranslation("categories");
	const themeColors = useThemeColors();
	const { width } = useWindowDimensions();
	const category = order.category_id
		? CATEGORIES.find((c) => c.id === order.category_id)
		: undefined;
	const CategoryIcon: LucideIcon = category?.icon ?? ClipboardList;
	const categoryColor = Colors.primary;
	const initials = getPfpInitialsFallback(order.technician_name);
	const avatarColor = getAvatarColor(order.technician_name);
	const technicianImage = order.technician_image?.trim() || null;
	const avatarSize = width < 360 ? 52 : 64;
	const nameFontSize = width < 360 ? 16 : 18;
	const serviceName = translateServiceName(
		tc,
		order.service_id,
		order.service_name,
	);

	return (
		<View className="mb-stack-lg rounded-card bg-card p-card-roomy">
			<View className="flex-row gap-stack-lg" style={{ alignItems: "center" }}>
				<Avatar
					alt={order.technician_name ?? initials}
					className="items-center justify-center rounded-pill"
					style={{
						width: avatarSize,
						height: avatarSize,
						backgroundColor: avatarColor,
					}}
				>
					{technicianImage ? (
						<AvatarImage
							source={{ uri: technicianImage }}
							style={{
								width: avatarSize,
								height: avatarSize,
								borderRadius: avatarSize / 2,
							}}
						/>
					) : null}
					<AvatarFallback className="bg-transparent">
						<Text
							variant="body"
							className="font-bold"
							style={{
								fontSize: avatarSize * 0.32,
								color: themeColors.surfaceOnPrimary,
							}}
						>
							{initials}
						</Text>
					</AvatarFallback>
				</Avatar>
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
						{order.technician_name ?? t("card.technicianFallback")}
					</Text>
					<View className="mt-stack-xs min-w-0 flex-row items-center gap-stack-xs">
						<CategoryIcon
							size={spacing.icon.caption}
							color={categoryColor}
							strokeWidth={2}
						/>
						<Text
							variant="bodySm"
							style={{ flex: 1, color: themeColors.textSecondary }}
							numberOfLines={2}
						>
							{serviceName || t("card.serviceFallback")}
						</Text>
					</View>
				</View>
			</View>
		</View>
	);
}
