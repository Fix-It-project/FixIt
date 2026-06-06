import { ClipboardList, type LucideIcon } from "lucide-react-native";
import { useWindowDimensions, View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { getAvatarColor } from "@/src/features/booking-orders/utils/booking-helpers";
import { CATEGORIES } from "@/src/features/categories/constants/categories";
import { getPfpInitialsFallback } from "@/src/lib/initials";
import { spacing, useThemeColors } from "@/src/constants/design-tokens";
import type { TechnicianBooking } from "../../schemas/response.schema";

interface Props {
	readonly booking: TechnicianBooking;
}

export default function BookingClientCard({ booking }: Props) {
	const themeColors = useThemeColors();
	const { width } = useWindowDimensions();
	const category = CATEGORIES.find((c) => c.id === booking.category_id);
	const CategoryIcon: LucideIcon = category?.icon ?? ClipboardList;
	const categoryColor = themeColors.primary;
	const initials = getPfpInitialsFallback(booking.user_name);
	const avatarColor = getAvatarColor(booking.user_name);
	const avatarSize = width < 360 ? 52 : 64;
	const nameFontSize = width < 360 ? 16 : 18;

	return (
		<View className="mb-stack-lg rounded-card border border-edge bg-card p-card-roomy">
			<View className="flex-row gap-stack-lg" style={{ alignItems: "center" }}>
				<View
					className="items-center justify-center rounded-pill"
					style={{
						backgroundColor: avatarColor,
						width: avatarSize,
						height: avatarSize,
					}}
				>
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
				</View>
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
						{booking.user_name ?? "Unknown Client"}
					</Text>
					<View className="mt-stack-xs min-w-0 flex-row items-center gap-stack-xs">
						<CategoryIcon size={spacing.icon.caption} color={categoryColor} strokeWidth={2} />
						<Text
							variant="bodySm"
							style={{ flex: 1, color: themeColors.textSecondary }}
							numberOfLines={2}
						>
							{booking.service_name ?? "Service"}
						</Text>
					</View>
				</View>
			</View>
		</View>
	);
}
