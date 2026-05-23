// Quote negotiation panel — split into a chat surface and a sticky CTA.
//
// Round rules (5-round cap enforced by DB):
//   • Tech sends round 1.
//   • Either side can: Accept, Suggest counter (rounds 1-4), or Cancel order.
//   • Round 5 → no further counter; only Accept or Cancel.
//   • "Cancel order" is a destructive action (Ban icon) — it ends the order.

import { Ban, Check, MessageSquare, Pencil } from "lucide-react-native";
import { useMemo, useRef } from "react";
import { View } from "react-native";
import { useReducedMotion } from "react-native-reanimated";
import Toast from "react-native-toast-message";
import { Text } from "@/src/components/ui/text";
import { formatCurrency } from "@/src/lib/helpers/format-currency";
import {
	useOrderQuoteHistory,
	useTechAcceptUserQuote,
	useTechCancel,
	useTechSubmitQuote,
	useUserAcceptQuote,
	useUserCancelOrder,
	useUserSubmitQuote,
} from "@/src/features/booking-orders/hooks";
import type { OrderQuote } from "@/src/features/booking-orders/schemas/quote.schema";
import type { Order } from "@/src/features/booking-orders/schemas/response.schema";
import { radius, space, spacing, useThemeColors } from "@/src/lib/theme";
import IconActionButton from "./IconActionButton";
import QuoteBubble from "./QuoteBubble";
import QuoteOfferSheet, { type QuoteOfferSheetHandle } from "./QuoteOfferSheet";
import {
	StageActionRow,
	StagePrimaryAction,
	StageSecondaryAction,
} from "./StageAction";

export type QuoteChatPanelViewer = "user" | "technician";

interface QuoteChatProps {
	readonly order: Order;
	readonly viewer: QuoteChatPanelViewer;
}

const MAX_ROUNDS = 5;

function deriveQuoteState(
	rounds: readonly OrderQuote[],
	viewer: QuoteChatPanelViewer,
) {
	const roundCount = rounds.length;
	const roundsLeft = Math.max(0, MAX_ROUNDS - roundCount);
	const isFinalRound = roundCount >= MAX_ROUNDS;
	const latest = rounds[roundCount - 1] ?? null;
	const canActOnLatest = latest
		? viewer === "user"
			? latest.proposed_by === "technician"
			: latest.proposed_by === "user"
		: viewer === "technician";
	return { roundCount, roundsLeft, isFinalRound, latest, canActOnLatest };
}

export default function QuoteChatPanel({ order, viewer }: QuoteChatProps) {
	const themeColors = useThemeColors();
	const reducedMotion = useReducedMotion();

	const { data: rounds = [] } = useOrderQuoteHistory(order.id, { viewer });
	const { roundCount, canActOnLatest } = deriveQuoteState(rounds, viewer);
	const showWaiting = canActOnLatest === false && roundCount > 0;

	return (
		<View
			style={{
				borderRadius: radius.card,
				backgroundColor: themeColors.surfaceElevated,
				padding: space[4],
				gap: space[3],
			}}
		>
			<View
				style={{
					flexDirection: "row",
					alignItems: "center",
					gap: space[2],
				}}
			>
				<MessageSquare
					size={spacing.icon.caption}
					color={themeColors.primary}
					strokeWidth={2.4}
				/>
				<Text
					variant="bodySm"
					className="font-google-sans-bold"
					style={{ color: themeColors.textPrimary }}
				>
					Negotiation · Round {Math.min(MAX_ROUNDS, Math.max(1, roundCount))}/
					{MAX_ROUNDS}
				</Text>
			</View>

			<View style={{ gap: space[2] }}>
				{rounds.length === 0 ? (
					<Text
						variant="bodySm"
						className="text-content-secondary"
						style={{ textAlign: "center" }}
					>
						{viewer === "technician"
							? 'Press "Offer price" to send your first quote.'
							: "Waiting for technician to send a price."}
					</Text>
				) : (
					rounds.map((q, idx) => (
						<QuoteBubble
							key={q.id}
							item={q}
							index={idx}
							viewer={viewer}
							maxRounds={MAX_ROUNDS}
							isLatest={idx === rounds.length - 1}
							showWaiting={showWaiting}
							reducedMotion={reducedMotion}
						/>
					))
				)}
			</View>
		</View>
	);
}

export function QuoteChatCta({ order, viewer }: QuoteChatProps) {
	const themeColors = useThemeColors();
	const sheetRef = useRef<QuoteOfferSheetHandle>(null);

	const { data: rounds = [] } = useOrderQuoteHistory(order.id, { viewer });
	const { roundCount, roundsLeft, isFinalRound, latest, canActOnLatest } =
		deriveQuoteState(rounds, viewer);

	const techSubmit = useTechSubmitQuote();
	const userSubmit = useUserSubmitQuote();
	const techAccept = useTechAcceptUserQuote();
	const userAccept = useUserAcceptQuote();
	const techCancel = useTechCancel();
	const userCancel = useUserCancelOrder();

	const isSubmitPending =
		viewer === "technician" ? techSubmit.isPending : userSubmit.isPending;
	const isAcceptPending =
		viewer === "technician" ? techAccept.isPending : userAccept.isPending;
	const isCancelPending =
		viewer === "technician" ? techCancel.isPending : userCancel.isPending;

	function handleSheetSubmit({
		amount,
		note,
	}: {
		amount: number;
		note: string;
	}) {
		const args = {
			orderId: order.id,
			amount,
			notes: note.length > 0 ? note : undefined,
		};
		const mutation = viewer === "technician" ? techSubmit : userSubmit;
		mutation.mutate(args, {
			onSuccess: () => sheetRef.current?.close(),
			onError: (err) =>
				Toast.show({
					type: "error",
					text1: "Submit failed",
					text2: err.message,
				}),
		});
	}

	function openSheet() {
		sheetRef.current?.open({
			amount: latest?.amount ?? null,
			note: null,
		});
	}

	function handleAccept() {
		if (!latest) return;
		const args = { orderId: order.id, quoteId: latest.id };
		const mutation = viewer === "technician" ? techAccept : userAccept;
		mutation.mutate(args, {
			onError: (err) =>
				Toast.show({
					type: "error",
					text1: "Accept failed",
					text2: err.message,
				}),
		});
	}

	function handleCancel() {
		const args = { orderId: order.id, reason: "Negotiation ended" };
		const mutation = viewer === "technician" ? techCancel : userCancel;
		mutation.mutate(args, {
			onError: (err) =>
				Toast.show({
					type: "error",
					text1: "Cancel failed",
					text2: err.message,
				}),
		});
	}

	const showTechInitial = viewer === "technician" && roundCount === 0;
	// Counter CTA is shown only to the actor whose turn it is — i.e. the side
	// that DID NOT make the latest quote. Final round has no counter step.
	const showCounter =
		canActOnLatest &&
		!isFinalRound &&
		roundCount > 0 &&
		latest != null &&
		latest.proposed_by !== viewer;
	const showAcceptDecline = canActOnLatest && roundCount > 0;

	const sheetTitle = useMemo(() => {
		if (showTechInitial) return "Send your quote";
		if (viewer === "technician") return "Counter the customer";
		return "Suggest a different price";
	}, [showTechInitial, viewer]);
	const sheetSubtitle = useMemo(() => {
		if (showTechInitial) return "Inspect done — propose a fair price.";
		return `${roundsLeft} round${roundsLeft === 1 ? "" : "s"} left before lock-in.`;
	}, [showTechInitial, roundsLeft]);
	const sheetCta = showTechInitial ? "Send quote" : "Send counter";

	if (!showTechInitial && !showAcceptDecline) {
		return (
			<QuoteOfferSheet
				ref={sheetRef}
				title={sheetTitle}
				subtitle={sheetSubtitle}
				ctaLabel={sheetCta}
				isPending={isSubmitPending}
				previousAmount={latest?.amount ?? null}
				onSubmit={handleSheetSubmit}
			/>
		);
	}

	return (
		<View style={{ gap: space[2] }}>
			{showTechInitial ? (
				<StageActionRow
					primary={
						<StagePrimaryAction
							label="Offer price"
							icon={Pencil}
							onPress={openSheet}
							pending={isSubmitPending}
						/>
					}
					trailing={
						<IconActionButton
							icon={Ban}
							tone="danger"
							accessibilityLabel="Cancel order"
							onPress={handleCancel}
							pending={isCancelPending}
						/>
					}
				/>
			) : null}

			{showAcceptDecline ? (
				<>
					<StageActionRow
						primary={
							<StagePrimaryAction
								label={
									latest
										? `Accept ${formatCurrency(latest.amount)}`
										: "Accept"
								}
								icon={Check}
								tint={themeColors.success}
								onPress={handleAccept}
								pending={isAcceptPending}
							/>
						}
						trailing={
							<IconActionButton
								icon={Ban}
								tone="danger"
								accessibilityLabel="Cancel order"
								onPress={handleCancel}
								pending={isCancelPending}
							/>
						}
					/>
					{showCounter ? (
						<StageSecondaryAction
							label="Suggest another price"
							icon={Pencil}
							onPress={openSheet}
							pending={isSubmitPending}
						/>
					) : null}
				</>
			) : null}

			<QuoteOfferSheet
				ref={sheetRef}
				title={sheetTitle}
				subtitle={sheetSubtitle}
				ctaLabel={sheetCta}
				isPending={isSubmitPending}
				previousAmount={latest?.amount ?? null}
				onSubmit={handleSheetSubmit}
			/>
		</View>
	);
}
