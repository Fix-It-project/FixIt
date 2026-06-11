// Quote negotiation panel — split into a chat surface and a sticky CTA.
//
// Round rules (5-round cap enforced by DB):
//   • Tech sends round 1.
//   • Either side can: Accept, Suggest counter (rounds 1-4), or Cancel order.
//   • Round 5 → no further counter; only Accept or Cancel.
//   • "Cancel order" is a destructive action (Ban icon) — it ends the order.

import { Ban, Check, MessageSquare, Pencil } from "lucide-react-native";
import { useMemo, useRef, useState } from "react";
import { View } from "react-native";
import { useReducedMotion } from "react-native-reanimated";
import Toast from "react-native-toast-message";
import { Text } from "@/src/components/ui/text";
import { formatCurrency } from "@/src/features/booking-orders/utils/format-currency";
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
import { radius, space, spacing, useThemeColors } from "@/src/constants/design-tokens";
import { Button } from "@/src/components/ui/button";
import CancelReasonModal from "../../shared/CancelReasonModal";
import QuoteBubble from "./QuoteBubble";
import QuoteOfferSheet, { type QuoteOfferSheetHandle } from "./QuoteOfferSheet";

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
	const inspectionFee = order.inspection_fee ?? 0;

	const { data: rounds = [] } = useOrderQuoteHistory(order.id, { viewer });
	const { roundCount, canActOnLatest } = deriveQuoteState(rounds, viewer);
	const showWaiting = canActOnLatest === false && roundCount > 0;
	const latestQuote = rounds[rounds.length - 1] ?? null;
	const latestTotal =
		latestQuote != null ? latestQuote.amount + inspectionFee : inspectionFee;

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

			<View
				style={{
					borderRadius: radius.card,
					backgroundColor: `${themeColors.primary}10`,
					padding: space[3],
					gap: space[1],
				}}
			>
				<Text
					variant="caption"
					className="font-google-sans-bold uppercase"
					style={{ color: themeColors.textMuted, letterSpacing: 0.8 }}
				>
					Total pricing
				</Text>
				<Text variant="bodySm" style={{ color: themeColors.textSecondary }}>
					Inspection fee: {formatCurrency(inspectionFee)}
				</Text>
				<Text variant="bodySm" style={{ color: themeColors.textSecondary }}>
					Accepted total = work price + inspection fee
				</Text>
				{latestQuote ? (
					<Text
						variant="bodySm"
						className="font-google-sans-medium"
						style={{ color: themeColors.textPrimary }}
					>
						Latest total if accepted: {formatCurrency(latestTotal)}
					</Text>
				) : null}
			</View>

			<View style={{ gap: space[2] }}>
				{rounds.length === 0 ? (
					<Text
						variant="bodySm"
						className="text-content-secondary"
						style={{ textAlign: "center" }}
					>
						{viewer === "technician"
							? 'Press "Offer work price" to send your first quote.'
							: "Waiting for technician to send a work price."}
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
	const sheetRef = useRef<QuoteOfferSheetHandle>(null);
	const [cancelOpen, setCancelOpen] = useState(false);
	const [cancelReason, setCancelReason] = useState("");
	const inspectionFee = order.inspection_fee ?? 0;

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
					type: "info",
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
					type: "info",
					text1: "Accept failed",
					text2: err.message,
				}),
		});
	}

	function handleConfirmCancel() {
		const trimmed = cancelReason.trim();
		const args = {
			orderId: order.id,
			reason: trimmed.length > 0 ? trimmed : "Negotiation ended",
		};
		const mutation = viewer === "technician" ? techCancel : userCancel;
		mutation.mutate(args, {
			onSuccess: () => {
				setCancelOpen(false);
				setCancelReason("");
			},
			onError: (err) =>
				Toast.show({
					type: "info",
					text1: "Cancel failed",
					text2: err.message,
				}),
		});
	}

	const subjectName =
		viewer === "technician"
			? ((order as { user_name?: string | null }).user_name ?? null)
			: order.technician_name;

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
	const latestTotal = latest ? latest.amount + inspectionFee : null;

	const sheetTitle = useMemo(() => {
		if (showTechInitial) return "Send your work price";
		if (viewer === "technician") return "Counter the customer's work price";
		return "Suggest a different work price";
	}, [showTechInitial, viewer]);
	const sheetSubtitle = useMemo(() => {
		if (showTechInitial) {
			return `Inspection fee ${formatCurrency(inspectionFee)} will be added to your work price.`;
		}
		return `${roundsLeft} round${roundsLeft === 1 ? "" : "s"} left before lock-in. Inspection fee stays ${formatCurrency(inspectionFee)}.`;
	}, [inspectionFee, roundsLeft, showTechInitial]);
	const sheetCta = showTechInitial ? "Send work price" : "Send work counter";

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
				<View className="flex-row items-center gap-stack-md">
					<View className="flex-1">
						<Button
							variant="primary"
							size="lg"
							fullWidth
							iconLeft={Pencil}
							onPress={openSheet}
							loading={isSubmitPending}
						>
							Offer work price
						</Button>
					</View>
					<View className="shrink-0">
						<Button
							variant="destructive"
							size="icon"
							accessibilityLabel="Cancel order"
							onPress={() => setCancelOpen(true)}
							loading={isCancelPending}
						>
							<Ban size={20} />
						</Button>
					</View>
				</View>
			) : null}

			{showAcceptDecline ? (
				<>
					<View className="flex-row items-center gap-stack-md">
						<View className="flex-1">
							<Button
								variant="success"
								size="lg"
								fullWidth
								iconLeft={Check}
							onPress={handleAccept}
							loading={isAcceptPending}
						>
							{latestTotal != null
								? `Accept total ${formatCurrency(latestTotal)}`
								: "Accept"}
						</Button>
					</View>
						<View className="shrink-0">
							<Button
								variant="destructive"
								size="icon"
								accessibilityLabel="Cancel order"
								onPress={() => setCancelOpen(true)}
								loading={isCancelPending}
							>
								<Ban size={20} />
							</Button>
						</View>
					</View>
					{showCounter ? (
						<Button
							variant="secondary"
							size="lg"
							fullWidth
							iconLeft={Pencil}
							onPress={openSheet}
							loading={isSubmitPending}
						>
							Suggest another work price
						</Button>
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
			<CancelReasonModal
				visible={cancelOpen}
				title="Cancel Order"
				subjectRole="order"
				subjectName={subjectName}
				subjectFallback={
					viewer === "technician" ? "this customer" : "this technician"
				}
				reason={cancelReason}
				onReasonChange={setCancelReason}
				onClose={() => {
					if (isCancelPending) return;
					setCancelOpen(false);
				}}
				onConfirm={handleConfirmCancel}
				isLoading={isCancelPending}
			/>
		</View>
	);
}
