// One round's quote message bubble for the negotiation timeline.
// Extracted from QuoteChatPanel to keep that file focused on orchestration.

import { View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Text } from "@/src/components/ui/text";
import type { OrderQuote } from "@/src/features/booking-orders/schemas/quote.schema";
import { DUR_STAGGER, STAGGER_GAP } from "@/src/constants/animation";
import { formatAmount } from "@/src/features/booking-orders/utils/format-currency";
import { radius, space, useThemeColors } from "@/src/constants/design-tokens";

interface QuoteBubbleProps {
	readonly item: OrderQuote;
	readonly index: number;
	readonly viewer: "user" | "technician";
	readonly maxRounds: number;
	readonly isLatest: boolean;
	readonly showWaiting: boolean;
	readonly reducedMotion: boolean;
}

export default function QuoteBubble({
	item,
	index,
	viewer,
	maxRounds,
	isLatest,
	showWaiting,
	reducedMotion,
}: QuoteBubbleProps) {
	const themeColors = useThemeColors();
	const isSelf =
		(viewer === "user" && item.proposed_by === "user") ||
		(viewer === "technician" && item.proposed_by === "technician");

	const body = (
		<View
			style={{
				alignSelf: isSelf ? "flex-end" : "flex-start",
				maxWidth: "88%",
				gap: space[1],
			}}
		>
			<Text
				variant="caption"
				style={{
					color: themeColors.textMuted,
					alignSelf: isSelf ? "flex-end" : "flex-start",
				}}
			>
				{item.proposed_by === "user" ? "You" : "Technician"} · Round{" "}
				{item.round_number}
				{item.round_number === maxRounds ? " · Final" : ""}
			</Text>
			<View
				style={{
					backgroundColor: isSelf
						? themeColors.primary
						: themeColors.surfaceElevated,
					paddingHorizontal: space[3],
					paddingVertical: space[2],
					borderRadius: radius.card,
					borderTopRightRadius: isSelf ? space[1] : radius.card,
					borderTopLeftRadius: isSelf ? radius.card : space[1],
					gap: space[1],
				}}
			>
				<Text
					variant="bodyLg"
					className="font-google-sans-bold"
					style={{
						color: isSelf
							? themeColors.onPrimaryHeader
							: themeColors.textPrimary,
					}}
				>
					{formatAmount(item.amount)}{" "}
					<Text
						variant="caption"
						className="font-google-sans-medium"
						style={{
							color: isSelf
								? themeColors.onPrimaryHeader
								: themeColors.textSecondary,
						}}
					>
						EGP
					</Text>
				</Text>
				{item.notes ? (
					<Text
						variant="caption"
						style={{
							color: isSelf
								? themeColors.onPrimaryHeader
								: themeColors.textSecondary,
						}}
					>
						{item.notes}
					</Text>
				) : null}
			</View>
			{isLatest && showWaiting ? (
				<Text
					variant="caption"
					style={{
						color: themeColors.textMuted,
						alignSelf: isSelf ? "flex-end" : "flex-start",
					}}
				>
					{viewer === "user"
						? "Waiting on technician…"
						: "Waiting on customer…"}
				</Text>
			) : null}
		</View>
	);

	if (reducedMotion) return <View>{body}</View>;
	return (
		<Animated.View
			entering={FadeInDown.delay(index * STAGGER_GAP).duration(DUR_STAGGER)}
		>
			{body}
		</Animated.View>
	);
}
