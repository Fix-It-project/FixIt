import { MapPin, Star } from "lucide-react-native";
import { Image, View } from "react-native";
import { Text } from "@/src/components/ui/text";
import type { Technician } from "@/src/lib/mock-data/user";
import { Colors, useThemeColors } from "@/src/lib/theme";
import { spacing } from "@/src/lib/design-tokens";

export const CARD_WIDTH_RATIO = 0.75;
export const CARD_SPACING = spacing.control.segmented.gap;

const AVATAR_SIZE = spacing.avatar.card;
const AVATAR_OVERLAP = AVATAR_SIZE / 2;

interface TechnicianCardProps {
	readonly item: Technician;
	readonly cardWidth: number;
	readonly showReviewCount?: boolean;
	readonly showDistance?: boolean;
}

export default function TechnicianCard({
	item,
	cardWidth,
	showReviewCount = false,
	showDistance = false,
}: TechnicianCardProps) {
	const themeColors = useThemeColors();
	return (
		<View
			style={{
				width: cardWidth,
				marginHorizontal: CARD_SPACING / 2,
			}}
		>
			{/* Cover Image */}
			<Image
				source={item.coverImage}
				className="rounded-card"
				style={{
					width: "100%",
					height: cardWidth * 0.6,
				}}
				resizeMode="cover"
			/>

			{/* Avatar overlapping bottom of cover */}
			<View
				style={{
					marginTop: -AVATAR_OVERLAP,
					paddingLeft: spacing.stack.md,
				}}
			>
				<View
					className="items-center justify-center rounded-pill border-selected"
					style={{
						width: AVATAR_SIZE,
						height: AVATAR_SIZE,
						backgroundColor: item.avatarColor,
						borderColor: themeColors.surfaceElevated,
					}}
				>
					<Text variant="bodyLg" className="font-bold text-surface-on-primary">
						{item.initials}
					</Text>
				</View>
			</View>

			{/* Info below avatar */}
			<View className="mt-stack-xs pr-stack-sm pl-stack-md">
				<Text variant="buttonLg" className="text-content" numberOfLines={1}>
					{item.name}
				</Text>
				<View className="mt-px flex-row items-center gap-stack-xs">
					<Text
						variant="bodySm"
						className="shrink text-content-muted"
						numberOfLines={1}
					>
						{item.category}
					</Text>
					<View className="flex-row items-center gap-stack-xs">
						<Star
							size={11}
							color={Colors.ratingDefault}
							fill={Colors.ratingDefault}
							strokeWidth={0}
						/>
						<Text variant="bodySm" className="font-semibold text-content">
							{item.rating}
						</Text>
						{showReviewCount && (
							<Text variant="caption" className="text-content-muted">
								({item.reviewCount})
							</Text>
						)}
					</View>
					{showDistance && item.distance && (
						<View className="flex-row items-center gap-stack-xs">
							<MapPin
								size={11}
								color={themeColors.surfaceMuted}
								strokeWidth={2}
							/>
							<Text variant="caption" className="text-content-muted">
								{item.distance}
							</Text>
						</View>
					)}
				</View>
				<Text
					variant="bodySm"
					className="mt-px text-content-muted"
					numberOfLines={1}
				>
					{item.tagline}
				</Text>
			</View>
		</View>
	);
}
