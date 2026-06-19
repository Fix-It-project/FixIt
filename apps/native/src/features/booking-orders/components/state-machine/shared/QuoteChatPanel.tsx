// Quote negotiation panel — split into a chat surface and a sticky CTA.
//
// Round rules (5-round cap enforced by DB):
//   • Tech sends round 1.
//   • Either side can: Accept, Suggest counter (rounds 1-4), or Cancel order.
//   • Round 5 → no further counter; only Accept or Cancel.
//   • "Cancel order" is a destructive action (Ban icon) — it ends the order.

import { Ban, Check, Pencil } from "lucide-react-native";
import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useReducedMotion } from "react-native-reanimated";
import Toast from "react-native-toast-message";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import { radius, space, useThemeColors } from "@/src/constants/design-tokens";
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
import { formatCurrency } from "@/src/features/booking-orders/utils/format-currency";
import { translateOrderError } from "@/src/features/booking-orders/utils/translate-order-error";
import CancelReasonModal from "../../shared/CancelReasonModal";
import QuoteBubble from "./QuoteBubble";
import QuoteOfferSheet, { type QuoteOfferSheetHandle } from "./QuoteOfferSheet";

export type QuoteChatPanelViewer = "user" | "technician";

interface QuoteChatProps {
	readonly order: Order;
	readonly viewer: QuoteChatPanelViewer;
}

const MAX_ROUNDS = 5;

/** "EGP 250 – EGP 400" for the order's service, or null when unconfigured. */
function workPriceRangeLabel(order: Order): string | null {
	const min = order.service_min_price;
	const max = order.service_max_price;
	if (typeof min !== "number" || typeof max !== "number") return null;
	return `${formatCurrency(min)} – ${formatCurrency(max)}`;
}

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
	const { t } = useTranslation("orders");
	const themeColors = useThemeColors();
	const reducedMotion = useReducedMotion();
	const inspectionFee = order.inspection_fee ?? 0;

	const { data: rounds = [] } = useOrderQuoteHistory(order.id, { viewer });
	const { roundCount, canActOnLatest } = deriveQuoteState(rounds, viewer);
	const showWaiting = canActOnLatest === false && roundCount > 0;
	const latestQuote = rounds[rounds.length - 1] ?? null;
	const latestTotal =
		latestQuote != null ? latestQuote.amount + inspectionFee : inspectionFee;
	const rangeLabel = workPriceRangeLabel(order);

	return (
		<View
			style={{
				borderRadius: radius.card,
				backgroundColor: themeColors.surfaceElevated,
				padding: space[4],
				gap: space[3],
			}}
		>
			<View style={{ gap: space[2] }}>
				{rounds.length === 0 ? (
					<Text
						variant="bodySm"
						className="text-content-secondary"
						style={{ textAlign: "center" }}
					>
						{viewer === "technician"
							? t("detail.quote.emptyTech")
							: t("detail.quote.emptyUser")}
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

			{latestQuote ? (
				<View
					style={{
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "space-between",
					}}
				>
					<Text variant="bodySm" style={{ color: themeColors.textSecondary }}>
						{t("detail.quote.totalIfAccepted")}
					</Text>
					<Text
						variant="body"
						className="font-google-sans-bold"
						style={{ color: themeColors.primary }}
					>
						{formatCurrency(latestTotal)}
					</Text>
				</View>
			) : rangeLabel ? (
				<Text variant="caption" style={{ color: themeColors.textMuted }}>
					{t("detail.quote.workPriceRange", { range: rangeLabel })}
				</Text>
			) : null}
		</View>
	);
}

export function QuoteChatCta({ order, viewer }: QuoteChatProps) {
	const { t } = useTranslation("orders");
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
					text1: t("detail.quote.toastSubmitFailed"),
					text2: translateOrderError(err),
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
					text1: t("detail.quote.toastAcceptFailed"),
					text2: translateOrderError(err),
				}),
		});
	}

	function handleConfirmCancel() {
		const trimmed = cancelReason.trim();
		const args = {
			orderId: order.id,
			reason:
				trimmed.length > 0 ? trimmed : t("detail.quote.cancelReasonDefault"),
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
					text1: t("detail.quote.toastCancelFailed"),
					text2: translateOrderError(err),
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
		if (showTechInitial) return t("detail.quote.sheetTitleInitial");
		if (viewer === "technician") return t("detail.quote.sheetTitleCounterTech");
		return t("detail.quote.sheetTitleCounterUser");
	}, [showTechInitial, viewer, t]);
	const sheetSubtitle = useMemo(() => {
		if (showTechInitial) {
			return t("detail.quote.sheetSubtitleInitial", {
				amount: formatCurrency(inspectionFee),
			});
		}
		return t(
			roundsLeft === 1
				? "detail.quote.roundsLeftOne"
				: "detail.quote.roundsLeftOther",
			{
				n: roundsLeft,
				amount: formatCurrency(inspectionFee),
			},
		);
	}, [inspectionFee, roundsLeft, showTechInitial, t]);
	const sheetCta = showTechInitial
		? t("detail.quote.ctaSendQuote")
		: t("detail.quote.ctaSendCounter");

	if (!showTechInitial && !showAcceptDecline) {
		return (
			<QuoteOfferSheet
				ref={sheetRef}
				title={sheetTitle}
				subtitle={sheetSubtitle}
				ctaLabel={sheetCta}
				isPending={isSubmitPending}
				previousAmount={latest?.amount ?? null}
				minPrice={order.service_min_price}
				maxPrice={order.service_max_price}
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
							{t("detail.quote.offerPrice")}
						</Button>
					</View>
					<View className="shrink-0">
						<Button
							variant="destructive"
							size="icon"
							accessibilityLabel={t("detail.a11y.cancelOrder")}
							onPress={() => setCancelOpen(true)}
							loading={isCancelPending}
						>
							<Ban size={20} />
						</Button>
					</View>
				</View>
			) : null}

			{showAcceptDecline ? (
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
								? t("detail.quote.acceptAmount", {
										amount: formatCurrency(latestTotal),
									})
								: t("detail.quote.accept")}
						</Button>
					</View>
					{showCounter ? (
						<View className="shrink-0">
							<Button
								variant="secondary"
								size="icon"
								accessibilityLabel={t("detail.quote.suggestAnother")}
								onPress={openSheet}
								loading={isSubmitPending}
							>
								<Pencil size={20} />
							</Button>
						</View>
					) : null}
					<View className="shrink-0">
						<Button
							variant="destructive"
							size="icon"
							accessibilityLabel={t("detail.a11y.cancelOrder")}
							onPress={() => setCancelOpen(true)}
							loading={isCancelPending}
						>
							<Ban size={20} />
						</Button>
					</View>
				</View>
			) : null}

			<QuoteOfferSheet
				ref={sheetRef}
				title={sheetTitle}
				subtitle={sheetSubtitle}
				ctaLabel={sheetCta}
				isPending={isSubmitPending}
				previousAmount={latest?.amount ?? null}
				minPrice={order.service_min_price}
				maxPrice={order.service_max_price}
				onSubmit={handleSheetSubmit}
			/>
			<CancelReasonModal
				visible={cancelOpen}
				title={t("detail.cancelModal.title")}
				subjectRole="order"
				subjectName={subjectName}
				subjectFallback={
					viewer === "technician"
						? t("detail.cancelModal.subjectFallbackCustomer")
						: t("detail.cancelModal.subjectFallback")
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
