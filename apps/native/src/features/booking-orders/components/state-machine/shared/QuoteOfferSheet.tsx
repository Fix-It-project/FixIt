// Migrated to declarative <Dialog> with <Dialog.Form> in Phase 11 Plan 07.
// CRITICAL: This is a Dialog (NOT a BottomSheet) — locked decision in 11-CONTEXT.md.
// QuoteOffer is a focused price-entry form that was a centered Modal; it remains centered.

import { forwardRef, useImperativeHandle, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { Button } from "@/src/components/ui/button";
import { Dialog } from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Text } from "@/src/components/ui/text";
import { Textarea } from "@/src/components/ui/textarea";
import { formatCurrency } from "@/src/features/booking-orders/utils/format-currency";
import { space, useThemeColors } from "@/src/constants/design-tokens";

export interface QuoteOfferSheetHandle {
	open: (defaults?: { amount?: number | null; note?: string | null }) => void;
	close: () => void;
}

interface QuoteOfferSheetProps {
	readonly title: string;
	readonly subtitle: string;
	readonly ctaLabel: string;
	readonly currency?: string;
	readonly isPending: boolean;
	readonly previousAmount: number | null;
	/** Service work-price range. When both are set, the amount is constrained to
	 *  [minPrice, maxPrice] (mirrors the DB guard rpc_submit_quote/price_out_of_range). */
	readonly minPrice?: number | null;
	readonly maxPrice?: number | null;
	readonly onSubmit: (args: { amount: number; note: string }) => void;
}

const QuoteOfferSheet = forwardRef<QuoteOfferSheetHandle, QuoteOfferSheetProps>(
	function QuoteOfferSheet(
		{
			title,
			subtitle,
			ctaLabel,
			currency = "EGP",
			isPending,
			previousAmount,
			minPrice,
			maxPrice,
			onSubmit,
		},
		ref,
	) {
		const { t } = useTranslation("orders");
		const themeColors = useThemeColors();
		const [visible, setVisible] = useState(false);
		const [amount, setAmount] = useState("");
		const [note, setNote] = useState("");

		const hasRange =
			typeof minPrice === "number" && typeof maxPrice === "number";
		const rangeLabel = hasRange
			? `${formatCurrency(minPrice as number, currency)} – ${formatCurrency(maxPrice as number, currency)}`
			: null;

		const close = () => setVisible(false);

		useImperativeHandle(
			ref,
			() => ({
				open: (defaults) => {
					setAmount(
						typeof defaults?.amount === "number" ? String(defaults.amount) : "",
					);
					setNote(defaults?.note ?? "");
					setVisible(true);
				},
				close: () => setVisible(false),
			}),
			[],
		);

		const handleSubmit = () => {
			const parsed = Number.parseInt(amount, 10);
			if (!Number.isInteger(parsed) || parsed <= 0) {
				Toast.show({
					type: "info",
					text1: t("detail.quote.offer.invalidTitle"),
					text2: t("detail.quote.offer.invalidBody"),
				});
				return;
			}
			if (typeof previousAmount === "number" && parsed === previousAmount) {
				Toast.show({
					type: "info",
					text1: t("detail.quote.offer.sameTitle"),
					text2: t("detail.quote.offer.sameBody"),
				});
				return;
			}
			if (
				hasRange &&
				(parsed < (minPrice as number) || parsed > (maxPrice as number))
			) {
				Toast.show({
					type: "info",
					text1: t("detail.quote.offer.outOfRangeTitle"),
					text2: t("detail.quote.offer.outOfRangeBody", { range: rangeLabel }),
				});
				return;
			}
			onSubmit({ amount: parsed, note: note.trim() });
		};

		const submitDisabled = isPending || amount.trim().length === 0;

		return (
			<Dialog visible={visible} onClose={close} dismissible={!isPending}>
				<Dialog.Header>{title}</Dialog.Header>
				<Dialog.Body>
					<Text variant="bodySm" style={{ color: themeColors.textSecondary }}>
						{subtitle}
					</Text>
				</Dialog.Body>
				<Dialog.Form>
					<View style={{ gap: space[4] }}>
						<View style={{ gap: space[2] }}>
							<Input
								value={amount}
								onChangeText={setAmount}
								keyboardType="decimal-pad"
								placeholder={t("detail.quote.offer.amountPlaceholder", {
									currency,
								})}
								autoFocus
							/>
							{rangeLabel ? (
								<Text
									variant="caption"
									className="font-google-sans-medium"
									style={{ color: themeColors.primary }}
								>
									{t("detail.quote.offer.rangeHint", { range: rangeLabel })}
								</Text>
							) : undefined}
							{typeof previousAmount === "number" ? (
								<Text
									variant="caption"
									style={{ color: themeColors.textMuted }}
								>
									{t("detail.quote.offer.lastOffer", {
										amount: formatCurrency(previousAmount, currency),
									})}
								</Text>
							) : undefined}
						</View>
						<Textarea
							value={note}
							onChangeText={setNote}
							placeholder={t("detail.quote.offer.notePlaceholder")}
							numberOfLines={3}
						/>
					</View>
				</Dialog.Form>
				<Dialog.Footer>
					<Button variant="secondary" onPress={close} disabled={isPending}>
						{t("detail.quote.offer.cancel")}
					</Button>
					<Button
						variant="primary"
						onPress={handleSubmit}
						loading={isPending}
						disabled={submitDisabled}
					>
						{ctaLabel}
					</Button>
				</Dialog.Footer>
			</Dialog>
		);
	},
);

export default QuoteOfferSheet;
