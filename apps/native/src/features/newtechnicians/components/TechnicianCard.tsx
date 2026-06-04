import {
	Banknote,
	CalendarDays,
	type LucideIcon,
	Navigation,
	Phone,
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
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { Separator } from "@/src/components/ui/separator";
import { Text } from "@/src/components/ui/text";
import { DUR_CARDS } from "@/src/constants/animation";
import {
	ESTIMATED_INSPECTION_FEE_EGP,
	formatInspectionFee,
} from "@/src/constants/booking";
import { spacing, useThemeColors } from "@/src/constants/design-tokens";
import { formatRating } from "@/src/constants/format";
import type { TechnicianListItem } from "@/src/features/technicians/schemas/response.schema";
import { getPfpInitialsFallback } from "@/src/lib/initials";

interface TechnicianCardProps {
	readonly item: TechnicianListItem;
	readonly index: number;
	/** Tapping the card (or its CTA) opens the technician detail page. */
	readonly onPress: (item: TechnicianListItem) => void;
	/** Tapping the avatar opens the quick-profile bottom sheet. */
	readonly onAvatarPress: (technicianId: string, initials: string) => void;
}

function formatDistanceAway(distanceKm: number | null): string {
	if (distanceKm == null) return "N/A";
	return `${distanceKm.toFixed(1)} km away`;
}

function FactItem({
	icon: Icon,
	label,
	value,
	tone,
	withDivider = false,
}: {
	readonly icon: LucideIcon;
	readonly label: string;
	readonly value: string;
	readonly tone: string;
	readonly withDivider?: boolean;
}) {
	return (
		<View
			className={withDivider ? "min-w-0 flex-1 pl-stack-sm" : "min-w-0 flex-1"}
		>
			<View className="mb-stack-xs h-icon-xs justify-center">
				<Icon size={spacing.icon.xs} color={tone} strokeWidth={2.1} />
			</View>
			<View className="min-w-0">
				<Text variant="caption" className="text-content-muted">
					{label}
				</Text>
				<Text
					variant="caption"
					className="font-medium text-content"
					numberOfLines={1}
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

	const entering = reduceMotion
		? undefined
		: FadeInDown.duration(DUR_CARDS).delay(Math.min(index, 8) * 45);

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
				className="rounded-card border border-edge bg-card p-card-compact"
				accessibilityRole="button"
				accessibilityLabel={`Book ${fullName}`}
				testID="technician-card"
			>
				<View className="flex-row items-start gap-stack-md">
					<PressableScale
						onPress={handleAvatarPress}
						pressedScale={0.94}
						className="h-avatar-md w-avatar-md"
						accessibilityRole="button"
						accessibilityLabel={`Open ${fullName} profile`}
					>
						<Avatar
							alt={initials}
							className="h-avatar-md w-avatar-md rounded-full bg-app-primary-light"
						>
							<AvatarFallback className="bg-app-primary-light">
								<Text
									variant="bodySm"
									className="font-semibold text-app-primary"
								>
									{initials}
								</Text>
							</AvatarFallback>
						</Avatar>
					</PressableScale>

					<View className="min-w-0 flex-1">
						<Text
							variant="bodySm"
							className="font-semibold text-content"
							numberOfLines={1}
						>
							{fullName}
						</Text>
						<View className="mt-stack-xs flex-row items-center gap-stack-xs">
							<Star
								size={spacing.icon.xs}
								color={themeColors.ratingDefault}
								fill={themeColors.ratingDefault}
								strokeWidth={0}
							/>
							<Text variant="caption" className="font-semibold text-content">
								{ratingLabel}
							</Text>
							<Text variant="caption" className="text-content-muted">
								({reviewLabel})
							</Text>
						</View>
					</View>
				</View>

				<Separator className="my-stack-md bg-surface-muted" />

				<View className="flex-row gap-stack-sm">
					<FactItem
						icon={Navigation}
						label="Distance"
						value={formatDistanceAway(item.distance_km)}
						tone={themeColors.primary}
					/>
					<FactItem
						icon={Banknote}
						label="Inspection Fee"
						value={formatInspectionFee(ESTIMATED_INSPECTION_FEE_EGP)}
						tone={themeColors.success}
						withDivider
					/>
					<FactItem
						icon={Phone}
						label="Phone"
						value={item.phone?.trim() || "Phone unavailable"}
						tone={themeColors.accentPurple}
						withDivider
					/>
				</View>

				<View className="mt-stack-md">
					<Button
						size="sm"
						fullWidth
						iconLeft={CalendarDays}
						onPress={handleBookPress}
					>
						Book Now
					</Button>
				</View>
			</PressableScale>
		</Animated.View>
	);
}

export const TechnicianCard = memo(TechnicianCardComponent);
