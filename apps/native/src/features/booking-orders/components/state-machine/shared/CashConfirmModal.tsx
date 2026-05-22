// Phase 4c Plan 06 — CashConfirmModal (user side, net-new).
//
// Shown when the user wants to confirm they paid in cash.
// Calls useUserConfirmCompletion per 4a reality — there is no /confirm-paid
// endpoint; both sides route through confirm-completion.
//
// Shell mirrors CancelReasonModal.tsx:42-152. TextInput stripped.
// All colors via theme tokens — zero inline literals.

import { X } from "lucide-react-native";
import {
	ActivityIndicator,
	Modal,
	Pressable,
	TouchableOpacity,
	View,
} from "react-native";
import Toast from "react-native-toast-message";
import { Text } from "@/src/components/ui/text";
import { useUserConfirmCompletion } from "@/src/features/booking-orders/hooks";
import { spacing, useThemeColors } from "@/src/lib/theme";

interface Props {
	readonly visible: boolean;
	readonly onClose: () => void;
	readonly orderId: string;
	readonly amount: number;
}

export default function CashConfirmModal({
	visible,
	onClose,
	orderId,
	amount,
}: Props) {
	const themeColors = useThemeColors();
	const mutation = useUserConfirmCompletion();

	const handleConfirm = () => {
		mutation.mutate(
			{ orderId },
			{
				onSuccess: () => {
					onClose();
				},
				onError: (err) => {
					Toast.show({
						type: "error",
						text1: "Payment confirmation failed",
						text2: err instanceof Error ? err.message : "Please try again.",
					});
				},
			},
		);
	};

	return (
		<Modal
			visible={visible}
			transparent
			animationType="fade"
			onRequestClose={onClose}
		>
			<Pressable
				style={{
					flex: 1,
					backgroundColor: themeColors.backdrop,
					justifyContent: "center",
					alignItems: "center",
				}}
				onPress={onClose}
			>
				<Pressable
					onPress={() => {}}
					className="w-modal rounded-sheet p-sheet"
					style={{ backgroundColor: themeColors.surfaceBase }}
				>
					<View className="mb-stack-lg flex-row items-center justify-between">
						<Text variant="h3" style={{ color: themeColors.textPrimary }}>
							Confirm cash payment
						</Text>
						<TouchableOpacity
							onPress={onClose}
							className="h-control-icon-box-sm w-control-icon-box-sm items-center justify-center rounded-pill"
							style={{ backgroundColor: themeColors.surfaceElevated }}
						>
							<X size={spacing.icon.xs} color={themeColors.textSecondary} />
						</TouchableOpacity>
					</View>

					<Text
						variant="bodySm"
						className="mb-stack-lg"
						style={{ color: themeColors.textSecondary }}
					>
						{`Confirm you paid ${amount} EGP in cash`}
					</Text>

					<View className="flex-row gap-card-compact">
						<TouchableOpacity
							onPress={onClose}
							className="flex-1 items-center rounded-input border py-stack-md"
							style={{
								borderColor: themeColors.borderDefault,
								backgroundColor: themeColors.surfaceBase,
							}}
							activeOpacity={0.7}
						>
							<Text
								variant="buttonMd"
								style={{ color: themeColors.textPrimary }}
							>
								Cancel
							</Text>
						</TouchableOpacity>

						<TouchableOpacity
							onPress={handleConfirm}
							disabled={mutation.isPending}
							className="flex-1 items-center rounded-input py-stack-md"
							style={{
								backgroundColor: mutation.isPending
									? themeColors.borderDefault
									: themeColors.primary,
							}}
							activeOpacity={0.85}
						>
							{mutation.isPending ? (
								<ActivityIndicator
									size="small"
									color={themeColors.surfaceBase}
								/>
							) : (
								<Text
									variant="buttonMd"
									style={{ color: themeColors.surfaceBase }}
								>
									Confirm
								</Text>
							)}
						</TouchableOpacity>
					</View>
				</Pressable>
			</Pressable>
		</Modal>
	);
}
