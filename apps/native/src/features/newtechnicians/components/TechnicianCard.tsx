import {
	Banknote,
	CalendarDays,
	type LucideIcon,
	MapPin,
	Navigation,
	Star,
} from "lucide-react-native";
import { memo } from "react";
import type { GestureResponderEvent } from "react-native";
import { View } from "react-native";
import Animated, {
	FadeInDown,
	useReducedMotion,
} from "react-native-reanimated";
import { PressableScale } from "@/src/components/animation/pressable-scale";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { Separator } from "@/src/components/ui/separator";
import { Text } from "@/src/components/ui/text";
import { DUR_CARDS } from "@/src/constants/animation";
import { spacing, useThemeColors } from "@/src/constants/design-tokens";
import { formatRating } from "@/src/constants/format";
import { CATEGORIES } from "@/src/features/categories/constants/categories";
import type { TechnicianListItem } from "@/src/features/technicians/schemas/response.schema";
import { formatLocation } from "@/src/features/technicians/utils/technician-utils";
import { getPfpInitialsFallback } from "@/src/lib/initials";

interface TechnicianCardProps {
	readonly item: TechnicianListItem;
	readonly index: number;
	readonly inspectionFeeLabel?: string;
	/** Tapping the card (or its CTA) opens the technician detail page. */
	readonly onPress: (item: TechnicianListItem) => void;
	/** Tapping the avatar opens the quick-profile bottom sheet. */
	readonly onAvatarPress: (technicianId: string, initials: string) => void;
}

const DETAIL_ICON_SLOT_WIDTH = spacing.icon.md + spacing.stack.xs;
const BOOK_BUTTON_WIDTH =
	spacing.avatar.hero + spacing.stack.xl + spacing.stack.lg;
const TRAILING_BUTTON_RESERVED_WIDTH = BOOK_BUTTON_WIDTH + spacing.stack.sm;
const MAX_ENTERING_ANIMATED_CARDS = 8;

function formatDistanceAway(distanceKm: number | null): string {
	if (distanceKm == null) return "N/A";
	return `${distanceKm.toFixed(1)} km away`;
}

function formatCategoryLine(categoryId: string): string {
	const category = CATEGORIES.find((item) => item.id === categoryId);
	if (!category) return "Home service";
	return `${category.label} service`;
}

function DetailRow({
	icon: Icon,
	label,
	value,
	tone,
	trailingSpace = 0,
}: {
	readonly icon: LucideIcon;
	readonly label: string;
	readonly value: string;
	readonly tone: string;
	readonly trailingSpace?: number;
}) {
	return (
		<View className="min-w-0 flex-row items-center">
			<View style={{ width: DETAIL_ICON_SLOT_WIDTH }}>
				<Icon size={spacing.icon.xs} color={tone} strokeWidth={2} />
			</View>
			<View
				className="min-w-0 flex-1 flex-row items-center gap-stack-xs"
				style={{ paddingRight: trailingSpace }}
			>
				<Text
					variant="caption"
					className="shrink-0 text-content-secondary"
					numberOfLines={1}
					maxFontSizeMultiplier={1.05}
				>
					{label}
				</Text>
				<Text
					variant="caption"
					className="text-content-muted"
					maxFontSizeMultiplier={1.05}
				>
					•
				</Text>
				<Text
					variant="caption"
					className="min-w-0 flex-1 text-content"
					numberOfLines={1}
					maxFontSizeMultiplier={1.05}
				>
					{value}
				</Text>
			</View>
		</View>
	);
}

function TechnicianCardComponent({
	item,
	index,
	inspectionFeeLabel,
	onPress,
	onAvatarPress,
}: TechnicianCardProps) {
	const themeColors = useThemeColors();
	const reduceMotion = useReducedMotion();
	const fullName = `${item.first_name} ${item.last_name}`;
	const initials = getPfpInitialsFallback(fullName);
	const hasReviews = item.avg_rating !== null && item.review_count > 0;
	const ratingLabel = hasReviews ? formatRating(item.avg_rating ?? 0) : "New";
	const reviewLabel = hasReviews
		? `${item.review_count} ${item.review_count === 1 ? "review" : "reviews"}`
		: "No reviews yet";
	const subtitle =
		item.description?.trim() || formatCategoryLine(item.category_id);

	const entering =
		reduceMotion || index >= MAX_ENTERING_ANIMATED_CARDS
			? undefined
			: FadeInDown.duration(DUR_CARDS).delay(index * 45);

	function handleAvatarPress(event: GestureResponderEvent) {
		event.stopPropagation();
		onAvatarPress(item.id, initials);
	}

	function handleBookPress(event: GestureResponderEvent) {
		event.stopPropagation();
		onPress(item);
	}

	return (
		<Animated.View entering={entering} className="mx-screen-x mb-stack-md">
			<PressableScale
				onPress={() => onPress(item)}
				pressedScale={0.985}
				className="rounded-card bg-card px-card-compact py-stack-md"
				accessibilityRole="button"
				accessibilityLabel={`Book ${fullName}`}
				testID="technician-card"
			>
				<View className="flex-row items-center gap-stack-md pr-stack-xs">
					<PressableScale
						onPress={handleAvatarPress}
						pressedScale={0.94}
						className="h-avatar-lg w-avatar-lg"
						accessibilityRole="button"
						accessibilityLabel={`Open ${fullName} profile`}
					>
						<Avatar
							alt={initials}
							className="h-avatar-lg w-avatar-lg rounded-full bg-app-primary-light"
						>
							{item.profile_image ? (
								<AvatarImage source={{ uri: item.profile_image }} />
							) : null}
							<AvatarFallback className="bg-app-primary-light">
								<Text
									variant="body"
									className="font-google-sans-bold text-app-primary"
									style={{ includeFontPadding: false }}
									maxFontSizeMultiplier={1.05}
								>
									{initials}
								</Text>
							</AvatarFallback>
						</Avatar>
					</PressableScale>

					<View className="min-w-0 flex-1">
						<View className="min-w-0 flex-row items-center gap-stack-xs">
							<Text
								variant="body"
								className="min-w-0 shrink font-google-sans-bold text-content"
								numberOfLines={1}
								maxFontSizeMultiplier={1.05}
							>
								{fullName}
							</Text>
							<View className="shrink-0 flex-row items-center gap-stack-xs">
								<Star
									size={spacing.icon.caption}
									color={themeColors.ratingDefault}
									fill={themeColors.ratingDefault}
									strokeWidth={0}
								/>
								<Text
									variant="caption"
									className="font-semibold text-content"
									maxFontSizeMultiplier={1.05}
								>
									{ratingLabel}
								</Text>
								<Text
									variant="caption"
									className="text-content-secondary"
									maxFontSizeMultiplier={1.05}
								>
									({reviewLabel})
								</Text>
							</View>
						</View>
						<Text
							variant="caption"
							className="mt-stack-xs text-content-secondary"
							numberOfLines={2}
							maxFontSizeMultiplier={1.05}
						>
							{subtitle}
						</Text>
					</View>
				</View>

				<Separator className="my-stack-md" />

				<View className="relative gap-stack-sm">
					<DetailRow
						icon={Navigation}
						label="Distance"
						value={formatDistanceAway(item.distance_km)}
						tone={themeColors.primary}
					/>
					{inspectionFeeLabel ? (
						<DetailRow
							icon={Banknote}
							label="Inspection Fee"
							value={inspectionFeeLabel}
							tone={themeColors.success}
						/>
					) : null}
					<DetailRow
						icon={MapPin}
						label="Location"
						value={formatLocation(null, item.city, item.street)}
						tone={themeColors.accentCyan}
						trailingSpace={TRAILING_BUTTON_RESERVED_WIDTH}
					/>
					<Button
						size="sm"
						iconLeft={CalendarDays}
						onPress={handleBookPress}
						className="absolute right-0 bottom-0"
						style={{ width: BOOK_BUTTON_WIDTH }}
					>
						<Text
							variant="caption"
							className="font-semibold text-surface-on-primary"
							maxFontSizeMultiplier={1.05}
						>
							Book Now
						</Text>
					</Button>
				</View>
			</PressableScale>
		</Animated.View>
	);
}

export const TechnicianCard = memo(TechnicianCardComponent);
