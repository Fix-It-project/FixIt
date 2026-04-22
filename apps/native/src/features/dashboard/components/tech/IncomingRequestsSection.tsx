import { ClipboardList, type LucideIcon } from "lucide-react-native";
import {
	ActivityIndicator,
	ScrollView,
	TouchableOpacity,
	useWindowDimensions,
	View,
} from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";
import { Text } from "@/src/components/ui/text";
import { useTechRequestsStore } from "@/src/features/dashboard/stores/tech-requests-store";
import { CATEGORIES } from "@/src/lib/helpers/categories";
import {
	elevation,
	shadowStyle,
	type ThemePalette,
	useThemeColors,
} from "@/src/lib/theme";
import {
	useAcceptDashboardOrderMutation,
	useRejectDashboardOrderMutation,
} from "../../hooks/useDashboardOrderMutations";
import { usePendingDashboardOrders } from "../../hooks/useDashboardOrdersQuery";
import type { DashboardOrder } from "../../schemas/response.schema";
import RequestDetailsModal from "./RequestReviewModal";

const CARD_WIDTH_RATIO = 0.72;

function timeAgo(isoString: string): string {
	const diff = Date.now() - new Date(isoString).getTime();
	const minutes = Math.floor(diff / 60000);
	if (minutes < 1) return "just now";
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h ago`;
	return `${Math.floor(hours / 24)}d ago`;
}

function RequestCard({
	item,
	index,
	cardWidth,
	CategoryIcon,
	categoryColor,
	themeColors,
}: Readonly<{
	item: DashboardOrder;
	index: number;
	cardWidth: number;
	CategoryIcon: LucideIcon;
	categoryColor: string;
	themeColors: ThemePalette;
}>) {
	const openModal = useTechRequestsStore((s) => s.openModal);
	const acceptMutation = useAcceptDashboardOrderMutation();
	const rejectMutation = useRejectDashboardOrderMutation();
	const isBusy = acceptMutation.isPending || rejectMutation.isPending;

	return (
		<Animated.View
			entering={FadeInRight.delay(index * 100).duration(400)}
			className="mr-3"
			style={{ width: cardWidth }}
		>
			<TouchableOpacity activeOpacity={0.95} onPress={() => openModal(item)}>
				<View
					className="rounded-card bg-surface p-card"
					style={{
						borderWidth: 1,
						borderColor: themeColors.borderDefault,
						...shadowStyle(elevation.raised, {
							shadowColor: themeColors.shadow,
						}),
					}}
				>
					{/* Top row: category icon + title + received time */}
					<View className="mb-2 flex-row items-center gap-2">
						<View
							className="h-control-icon-box-md w-control-icon-box-md items-center justify-center rounded-button"
							style={{ backgroundColor: `${categoryColor}18` }}
						>
							<CategoryIcon size={20} color={categoryColor} strokeWidth={1.8} />
						</View>
						<View style={{ flex: 1 }}>
							<Text
								variant="bodySm"
								className="font-bold text-content"
								numberOfLines={1}
							>
								Service Request
							</Text>
							<Text variant="caption" className="text-content-muted uppercase">
								Received {timeAgo(item.created_at)}
							</Text>
						</View>
					</View>

					{/* Scheduled date */}
					<Text className="mb-2 text-content-muted text-xs">
						📅 {item.scheduled_date}
					</Text>

					{/* Problem description — 1 line only */}
					<Text className="mb-1 text-content-muted text-xs" numberOfLines={1}>
						{item.problem_description ?? "No description provided."}
					</Text>

					<Text
						variant="caption"
						className="mb-3 font-semibold"
						style={{ color: themeColors.primary }}
					>
						Tap to view details →
					</Text>

					{/* Action buttons */}
					<View className="flex-row gap-2">
						<TouchableOpacity
							className="flex-1 items-center rounded-button py-control-trigger-y"
							style={{
								backgroundColor: isBusy
									? themeColors.borderDefault
									: themeColors.primary,
							}}
							activeOpacity={0.85}
							disabled={isBusy}
							onPress={() => acceptMutation.mutate(item.id)}
						>
							{acceptMutation.isPending ? (
								<ActivityIndicator
									size="small"
									color={themeColors.surfaceBase}
								/>
							) : (
								<Text variant="caption" className="font-bold text-white">
									Accept
								</Text>
							)}
						</TouchableOpacity>

						<TouchableOpacity
							className="flex-1 items-center rounded-button border py-control-trigger-y"
							style={{
								borderColor: themeColors.borderDefault,
								backgroundColor: isBusy
									? themeColors.surfaceElevated
									: themeColors.surfaceBase,
							}}
							activeOpacity={0.7}
							disabled={isBusy}
							onPress={() => rejectMutation.mutate(item.id)}
						>
							{rejectMutation.isPending ? (
								<ActivityIndicator size="small" color={themeColors.textMuted} />
							) : (
								<Text variant="caption" className="font-bold text-content">
									Decline
								</Text>
							)}
						</TouchableOpacity>
					</View>
				</View>
			</TouchableOpacity>
		</Animated.View>
	);
}

interface IncomingRequestsSectionProps {
	readonly categoryName?: string | null;
}

export default function IncomingRequestsSection({
	categoryName,
}: IncomingRequestsSectionProps = {}) {
	const { width } = useWindowDimensions();
	const themeColors = useThemeColors();
	const cardWidth = width * CARD_WIDTH_RATIO;
	const { data: pendingOrders, isLoading } = usePendingDashboardOrders();

	const category = CATEGORIES.find(
		(c) => c.label.toLowerCase() === (categoryName ?? "").toLowerCase(),
	);
	const CategoryIcon: LucideIcon = category?.icon ?? ClipboardList;
	const categoryColor = category?.color ?? themeColors.primary;
	let content = (
		<ScrollView
			horizontal
			showsHorizontalScrollIndicator={false}
			contentContainerStyle={{ paddingHorizontal: 16 }}
		>
			{pendingOrders.map((item, index) => (
				<RequestCard
					key={item.id}
					item={item}
					index={index}
					cardWidth={cardWidth}
					CategoryIcon={CategoryIcon}
					categoryColor={categoryColor}
					themeColors={themeColors}
				/>
			))}
		</ScrollView>
	);

	if (isLoading) {
		content = (
			<View className="items-center py-6">
				<ActivityIndicator color={themeColors.primary} />
			</View>
		);
	} else if (pendingOrders.length === 0) {
		content = (
			<View
				className="mx-4 items-center rounded-2xl bg-surface px-4 py-6"
				style={{ borderWidth: 1, borderColor: themeColors.borderDefault }}
			>
				<Text className="text-content-muted text-sm">No pending requests</Text>
			</View>
		);
	}

	return (
		<View className="mt-6">
			{/* Section header */}
			<View className="mb-3 flex-row items-center justify-between px-4">
				<Text
					variant="caption"
					className="font-bold text-content-muted uppercase tracking-widest"
				>
					Incoming Requests
				</Text>
				{pendingOrders.length > 0 && (
					<View
						className="h-5 w-5 items-center justify-center rounded-full"
						style={{ backgroundColor: themeColors.primary }}
					>
						<Text
							variant="caption"
							className="font-bold"
							style={{ color: themeColors.surfaceBase }}
						>
							{pendingOrders.length}
						</Text>
					</View>
				)}
			</View>

			{content}

			{/* Single modal instance for all cards */}
			<RequestDetailsModal categoryName={categoryName} />
		</View>
	);
}
