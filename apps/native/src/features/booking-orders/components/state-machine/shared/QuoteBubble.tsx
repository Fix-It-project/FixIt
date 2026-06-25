// One round's quote message bubble for the negotiation timeline.
// Extracted from QuoteChatPanel to keep that file focused on orchestration.

import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
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

function QuoteBubbleBody({
	isSelf,
	proposerLabel,
	item,
	maxRounds,
	isLatest,
	showWaiting,
	viewer,
	themeColors,
	t,
}: {
	isSelf: boolean;
	proposerLabel: string;
	item: OrderQuote;
	maxRounds: number;
	isLatest: boolean;
	showWaiting: boolean;
	viewer: "user" | "technician";
	themeColors: ReturnType<typeof useThemeColors>;
	t: TFunction<"orders">;
}) {
	const selfAlign = isSelf ? "flex-end" : "flex-start";
	const subColor = isSelf
		? themeColors.onPrimaryHeader
		: themeColors.textSecondary;
	return (
		<View
			style={{
				alignSelf: selfAlign,
				maxWidth: "88%",
				gap: space[1],
			}}
		>
			<Text
				variant="caption"
				style={{
					color: themeColors.textMuted,
					alignSelf: selfAlign,
				}}
			>
				{proposerLabel} · {t("detail.quote.workPrice")} ·{" "}
				{t("detail.quote.round", { n: item.round_number })}
				{item.round_number === maxRounds
					? ` · ${t("detail.quote.final")}`
					: ""}
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
						style={{ color: subColor }}
					>
						{t("detail.quote.currency")}
					</Text>
				</Text>
				{item.notes ? (
					<Text variant="caption" style={{ color: subColor }}>
						{item.notes}
					</Text>
				) : null}
			</View>
			{isLatest && showWaiting ? (
				<Text
					variant="caption"
					style={{
						color: themeColors.textMuted,
						alignSelf: selfAlign,
					}}
				>
					{viewer === "user"
						? t("detail.quote.waitingTechnician")
						: t("detail.quote.waitingCustomer")}
				</Text>
			) : null}
		</View>
	);
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
	const { t } = useTranslation("orders");
	const themeColors = useThemeColors();
	const isSelf =
		(viewer === "user" && item.proposed_by === "user") ||
		(viewer === "technician" && item.proposed_by === "technician");
	let proposerLabel: string;
	if (isSelf) proposerLabel = t("detail.quote.you");
	else if (item.proposed_by === "user")
		proposerLabel = t("card.customerFallback");
	else proposerLabel = t("card.technicianFallback");

	const body = (
		<QuoteBubbleBody
			isSelf={isSelf}
			proposerLabel={proposerLabel}
			item={item}
			maxRounds={maxRounds}
			isLatest={isLatest}
			showWaiting={showWaiting}
			viewer={viewer}
			themeColors={themeColors}
			t={t}
		/>
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
