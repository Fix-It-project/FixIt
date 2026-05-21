import { Image } from "expo-image";
import { type Href, router } from "expo-router";
import { ClipboardList, type LucideIcon } from "lucide-react-native";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { ScreenSafeAreaView } from "@/src/components/layout/ScreenSafeAreaView";
import PageHeader from "@/src/components/PageHeader";
import { Text } from "@/src/components/ui/text";
import {
	formatDate,
	getAvatarColor,
} from "@/src/features/booking-orders/utils/booking-helpers";
import {
	getOrderStatusBadge,
	type OrderStatusPerspective,
} from "@/src/lib/order-status";
import { useDebounce } from "@/src/hooks/useDebounce";
import { spacing } from "@/src/lib/design-tokens";
import { CATEGORIES } from "@/src/lib/helpers/categories";
import { getPfpInitialsFallback } from "@/src/lib/helpers/pfp-initials-fallback";
import { Colors, useThemeColors } from "@/src/lib/theme";
import type { OrderStatus } from "@/src/schemas/shared.schema";

export interface PastOrdersListItem {
	readonly avatarImage?: string | null;
	readonly avatarName: string | null | undefined;
	readonly categoryId: string | null | undefined;
	readonly fallbackName: string;
	readonly id: string;
	readonly name: string | null | undefined;
	readonly route: Href;
	readonly scheduledDate: string;
	readonly serviceName: string | null | undefined;
	readonly status: OrderStatus;
}

interface Props {
	readonly items: readonly PastOrdersListItem[];
	readonly onBack?: () => void;
	readonly statusPerspective?: OrderStatusPerspective;
	readonly title?: string;
}

function PastOrderCard({
	item,
	statusPerspective,
}: {
	readonly item: PastOrdersListItem;
	readonly statusPerspective: OrderStatusPerspective;
}) {
	const themeColors = useThemeColors();
	const goToOrder = useDebounce(() => router.push(item.route as never));
	const category = item.categoryId
		? CATEGORIES.find((c) => c.id === item.categoryId)
		: undefined;
	const CategoryIcon: LucideIcon = category?.icon ?? ClipboardList;
	const categoryColor = category?.color ?? Colors.primary;
	const status = getOrderStatusBadge(
		item.status,
		themeColors,
		statusPerspective,
	);

	return (
		<TouchableOpacity
			activeOpacity={0.85}
			onPress={goToOrder}
			className="mb-stack-md rounded-card border border-edge bg-surface p-card"
		>
			<View className="flex-row items-center gap-stack-md">
				{item.avatarImage ? (
					<Image
						source={{ uri: item.avatarImage }}
						className="h-control-icon-box-touch w-control-icon-box-touch rounded-pill"
						contentFit="cover"
						style={{ backgroundColor: themeColors.surfaceElevated }}
					/>
				) : (
					<View
						className="h-control-icon-box-touch w-control-icon-box-touch items-center justify-center rounded-pill"
						style={{ backgroundColor: getAvatarColor(item.avatarName) }}
					>
						<Text
							variant="label"
							className="font-bold"
							style={{ color: themeColors.surfaceBase }}
						>
							{getPfpInitialsFallback(item.avatarName)}
						</Text>
					</View>
				)}

				<View className="flex-1">
					<Text
						variant="label"
						className="font-bold"
						style={{ color: themeColors.textPrimary }}
						numberOfLines={1}
					>
						{item.name ?? item.fallbackName}
					</Text>
					<View className="mt-stack-xs flex-row items-center gap-stack-xs">
						<CategoryIcon size={spacing.icon.caption} color={categoryColor} strokeWidth={2} />
						<Text
							variant="caption"
							style={{ color: themeColors.textSecondary }}
							numberOfLines={1}
						>
							{item.serviceName ?? "Service"}
						</Text>
					</View>
				</View>

				<View className="items-end">
					<Text variant="caption" style={{ color: themeColors.textMuted }}>
						{formatDate(item.scheduledDate)}
					</Text>
					<View
						className="mt-stack-xs rounded-pill px-stack-md py-stack-xs"
						style={{ backgroundColor: `${status.color}15` }}
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
			</View>
		</TouchableOpacity>
	);
}

export default function PastOrdersList({
	items,
	onBack,
	statusPerspective = "neutral",
	title = "Past Orders",
}: Props) {
	const themeColors = useThemeColors();

	return (
		<View className="flex-1 bg-surface-elevated">
			<ScreenSafeAreaView className="flex-1" edges={["top"]}>
				<PageHeader title={title} onBackPress={onBack} />

				<ScrollView
					className="flex-1"
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{
						padding: spacing.card.padding,
						paddingBottom: spacing.screen.scrollBottomInset,
					}}
				>
					{items.length === 0 ? (
						<View className="items-center py-stack-4xl">
							<Text variant="bodySm" style={{ color: themeColors.textMuted }}>
								No past orders yet
							</Text>
						</View>
					) : (
						items.map((item) => (
							<PastOrderCard
								key={item.id}
								item={item}
								statusPerspective={statusPerspective}
							/>
						))
					)}
				</ScrollView>
			</ScreenSafeAreaView>
		</View>
	);
}
