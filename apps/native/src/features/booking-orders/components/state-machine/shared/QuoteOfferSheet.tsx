import { ArrowRight, Tag } from "lucide-react-native";
import { forwardRef, useImperativeHandle, useState } from "react";
import {
	ActivityIndicator,
	KeyboardAvoidingView,
	Modal,
	Platform,
	Pressable,
	View,
} from "react-native";
import { Input } from "@/src/components/ui/input";
import Toast from "react-native-toast-message";
import { Text } from "@/src/components/ui/text";
import { PressableScale } from "@/src/components/ui/PressableScale";
import { formatCurrency } from "@/src/lib/helpers/format-currency";
import { radius, space, spacing, typography, useThemeColors } from "@/src/lib/theme";

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
			ctaLabel,
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
					setAmount(defaults?.amount != null ? String(defaults.amount) : "");
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
					type: "error",
					text1: "Invalid amount",
					text2: "Enter a positive whole number.",
				});
				return;
			}
			if (previousAmount != null && parsed === previousAmount) {
				Toast.show({
					type: "error",
					text1: "Same amount",
					text2: "Your offer must differ from the last one.",
				});
				return;
			}
			onSubmit({ amount: parsed, note: note.trim() });
		};

		const submitDisabled = isPending || amount.trim().length === 0;

		return (
			<Modal
				visible={visible}
				transparent
				animationType="none"
				statusBarTranslucent
				onRequestClose={close}
			>
				<Pressable
					onPress={close}
					style={{
						flex: 1,
						backgroundColor: themeColors.backdrop,
					}}
				>
					<KeyboardAvoidingView
						behavior={Platform.OS === "ios" ? "padding" : "height"}
						style={{
							width: "100%",
							flex: 1,
							justifyContent: "center",
							alignItems: "center",
							paddingHorizontal: space[4],
						}}
					>
						<Pressable
							onPress={(event) => event.stopPropagation()}
							style={{
								width: "100%",
								maxWidth: 360,
								padding: space[5],
								borderRadius: radius.card,
								backgroundColor: themeColors.surfaceBase,
								gap: space[5],
							}}
						>
							<View
								style={{
									flexDirection: "row",
									alignItems: "center",
									gap: space[3],
								}}
							>
								<View
									style={{
										width: 44,
										height: 44,
										borderRadius: radius.pill,
										alignItems: "center",
										justifyContent: "center",
										backgroundColor: `${themeColors.primary}1A`,
									}}
								>
									<Tag
										size={spacing.icon.sm}
										color={themeColors.primary}
										strokeWidth={2.4}
									/>
								</View>
								<View style={{ flex: 1, gap: space[1] }}>
									<Text
										variant="h3"
										className="font-google-sans-bold text-content"
									>
										{title}
									</Text>
									<Text variant="bodySm" className="text-content-secondary">
										{subtitle}
									</Text>
								</View>
							</View>

							<View style={{ gap: space[2] }}>
								<Text
									variant="caption"
									className="font-google-sans-bold uppercase"
									style={{ color: themeColors.textMuted, letterSpacing: 1 }}
								>
									Amount
								</Text>
								<View
									style={{
										flexDirection: "row",
										alignItems: "center",
										borderRadius: radius.button,
										borderWidth: 1,
										borderColor: themeColors.borderDefault,
										backgroundColor: themeColors.surfaceElevated,
										paddingHorizontal: space[4],
									}}
								>
									<Input
										value={amount}
										onChangeText={setAmount}
										keyboardType="decimal-pad"
										placeholder="0"
										autoFocus
										className="flex-1 border-0 bg-transparent px-0 font-google-sans-bold"
										style={[
											typography.h3,
											{
												paddingVertical: space[4],
												color: themeColors.textPrimary,
											},
										]}
									/>
									<Text
										variant="buttonMd"
										className="font-google-sans-bold"
										style={{ color: themeColors.textMuted }}
									>
										{currency}
									</Text>
								</View>
								{previousAmount != null ? (
									<Text
										variant="caption"
										style={{ color: themeColors.textMuted }}
									>
										Last offer: {formatCurrency(previousAmount, currency)}
									</Text>
								) : null}
							</View>

							<View style={{ gap: space[2] }}>
								<Text
									variant="caption"
									className="font-google-sans-bold uppercase"
									style={{ color: themeColors.textMuted, letterSpacing: 1 }}
								>
									Note (optional)
								</Text>
								<Input
									value={note}
									onChangeText={setNote}
									placeholder="Add context, parts, or labor breakdown"
									multiline
									style={{
										minHeight: 84,
										padding: space[4],
										borderRadius: radius.button,
										borderWidth: 1,
										borderColor: themeColors.borderDefault,
										backgroundColor: themeColors.surfaceElevated,
										color: themeColors.textPrimary,
									}}
								/>
							</View>

							<PressableScale onPress={handleSubmit} disabled={submitDisabled}>
								<View
									className="w-full flex-row items-center justify-between gap-stack-sm rounded-button px-button-x py-control-cta-y"
									style={{
										backgroundColor: submitDisabled
											? themeColors.borderDefault
											: themeColors.primary,
									}}
								>
									<View style={{ width: space[5] }} />
									{isPending ? (
										<ActivityIndicator
											size="small"
											color={themeColors.onPrimaryHeader}
										/>
									) : (
										<Text
											variant="buttonLg"
											className="font-google-sans-bold"
											style={{ color: themeColors.onPrimaryHeader }}
										>
											{ctaLabel}
										</Text>
									)}
									<ArrowRight
										size={spacing.icon.sm}
										color={themeColors.onPrimaryHeader}
										strokeWidth={2.4}
									/>
								</View>
							</PressableScale>
						</Pressable>
					</KeyboardAvoidingView>
				</Pressable>
			</Modal>
		);
	},
);

export default QuoteOfferSheet;
