import { type Href, router } from "expo-router";
import { ClipboardList, type LucideIcon } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { ScrollView, TouchableOpacity, View } from "react-native";
import PageHeader from "@/src/components/layout/PageHeader";
import { ScreenSafeAreaView } from "@/src/components/layout/ScreenSafeAreaView";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/src/components/ui/avatar";
import { Text } from "@/src/components/ui/text";
import { Colors, spacing, useThemeColors } from "@/src/constants/design-tokens";
import {
	formatDate,
	formatTime,
	getAvatarColor,
} from "@/src/features/booking-orders/utils/booking-helpers";
import {
	getOrderStatusBadge,
	type OrderStatusPerspective,
} from "@/src/features/booking-orders/utils/order-status-ui";
import {
	CATEGORIES,
	translateServiceName,
} from "@/src/features/categories/constants/categories";
import { useDebounce } from "@/src/hooks/useDebounce";
import { getPfpInitialsFallback } from "@/src/lib/initials";
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
	readonly scheduledStartAt?: string | null;
	readonly serviceId?: string | null;
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
	const { t, i18n } = useTranslation("orders");
	const { t: tc } = useTranslation("categories");
	const themeColors = useThemeColors();
	const goToOrder = useDebounce(() => router.push(item.route as never));
	const category = item.categoryId
		? CATEGORIES.find((c) => c.id === item.categoryId)
		: undefined;
	const CategoryIcon: LucideIcon = category?.icon ?? ClipboardList;
	const categoryColor = Colors.primary;
	const status = getOrderStatusBadge(
		item.status,
		themeColors,
		statusPerspective,
		t,
	);
	const scheduledTime = formatTime(item.scheduledStartAt, i18n.language);
	const avatarImage = item.avatarImage?.trim() || null;
	const serviceName = translateServiceName(
		tc,
		item.serviceId,
		item.serviceName,
	);

	return (
		<TouchableOpacity
			activeOpacity={0.85}
			onPress={goToOrder}
			className="mb-stack-md rounded-card bg-card p-card"
		>
			<View className="flex-row items-center gap-stack-md">
				<Avatar
					alt={item.avatarName ?? getPfpInitialsFallback(item.avatarName)}
					className="h-control-icon-box-touch w-control-icon-box-touch items-center justify-center rounded-pill"
					style={{ backgroundColor: getAvatarColor(item.avatarName) }}
				>
					{avatarImage ? (
						<AvatarImage
							source={{ uri: avatarImage }}
							className="h-control-icon-box-touch w-control-icon-box-touch rounded-pill"
						/>
					) : null}
					<AvatarFallback className="bg-transparent">
						<Text
							variant="label"
							className="font-bold"
							style={{ color: themeColors.surfaceOnPrimary }}
						>
							{getPfpInitialsFallback(item.avatarName)}
						</Text>
					</AvatarFallback>
				</Avatar>

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

				<View className="items-end">
					<Text variant="caption" style={{ color: themeColors.textMuted }}>
						{formatDate(item.scheduledDate, i18n.language)}
						{scheduledTime ? ` • ${scheduledTime}` : ""}
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
	title,
}: Props) {
	const { t } = useTranslation("orders");
	const themeColors = useThemeColors();

	return (
		<View className="flex-1 bg-surface">
			<ScreenSafeAreaView className="flex-1" edges={["top"]}>
				<PageHeader title={title ?? t("list.pastTitle")} onBackPress={onBack} />

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
								{t("list.pastEmpty")}
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
