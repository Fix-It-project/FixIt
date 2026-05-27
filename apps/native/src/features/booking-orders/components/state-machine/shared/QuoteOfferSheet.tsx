// Migrated to declarative <Dialog> with <Dialog.Form> in Phase 11 Plan 07.
// CRITICAL: This is a Dialog (NOT a BottomSheet) — locked decision in 11-CONTEXT.md.
// QuoteOffer is a focused price-entry form that was a centered Modal; it remains centered.

import { forwardRef, useImperativeHandle, useState } from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { Button } from "@/src/components/ui/button";
import { Dialog } from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Text } from "@/src/components/ui/text";
import { formatCurrency } from "@/src/lib/helpers/format-currency";
import { space, useThemeColors } from "@/src/lib/theme";

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
	readonly onSubmit: (args: { amount: number; note: string }) => void;
}

const QuoteOfferSheet = forwardRef<QuoteOfferSheetHandle, QuoteOfferSheetProps>(
	function QuoteOfferSheet(
		{
			title,
			subtitle,
			currency = "EGP",
			isPending,
			previousAmount,
			onSubmit,
		},
		ref,
	) {
		const themeColors = useThemeColors();
		const [visible, setVisible] = useState(false);
		const [amount, setAmount] = useState("");
		const [note, setNote] = useState("");

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
					text1: "Invalid amount",
					text2: "Enter a positive whole number.",
				});
				return;
			}
			if (typeof previousAmount === "number" && parsed === previousAmount) {
				Toast.show({
					type: "info",
					text1: "Same amount",
					text2: "Your offer must differ from the last one.",
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
								placeholder={`Amount (${currency})`}
								autoFocus
							/>
							{typeof previousAmount === "number" ? (
								<Text
									variant="caption"
									style={{ color: themeColors.textMuted }}
								>
									Last offer: {formatCurrency(previousAmount, currency)}
								</Text>
							) : undefined}
						</View>
						<Input
							value={note}
							onChangeText={setNote}
							placeholder="Add a note (optional)"
							multiline
							numberOfLines={3}
						/>
					</View>
				</Dialog.Form>
				<Dialog.Footer>
					<Button variant="secondary" onPress={close} disabled={isPending}>
						Cancel
					</Button>
					<Button
						variant="primary"
						onPress={handleSubmit}
						loading={isPending}
						disabled={submitDisabled}
					>
						Send
					</Button>
				</Dialog.Footer>
			</Dialog>
		);
	},
);

export default QuoteOfferSheet;
