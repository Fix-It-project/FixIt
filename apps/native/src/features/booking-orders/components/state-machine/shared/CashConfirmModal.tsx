// Phase 4c Plan 06 — CashConfirmModal (user side, net-new).
//
// Shown when the user wants to confirm they paid in cash.
// Calls useUserConfirmCompletion per 4a reality — there is no /confirm-paid
// endpoint; both sides route through confirm-completion.
//
// Binary confirmation: use AlertDialog, not Dialog.

import Toast from "react-native-toast-message";
import { AlertDialog } from "@/src/components/ui/alert-dialog";
import { Button } from "@/src/components/ui/button";
import { useUserConfirmCompletion } from "@/src/features/booking-orders/hooks";

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
		<AlertDialog visible={visible} onClose={onClose}>
			<AlertDialog.Header>Confirm cash payment</AlertDialog.Header>
			<AlertDialog.Body>{`Confirm you paid ${amount} EGP in cash`}</AlertDialog.Body>
			<AlertDialog.Footer>
				<Button
					variant="secondary"
					onPress={onClose}
					disabled={mutation.isPending}
				>
					Cancel
				</Button>
				<Button
					variant="primary"
					onPress={handleConfirm}
					loading={mutation.isPending}
				>
					Confirm
				</Button>
			</AlertDialog.Footer>
		</AlertDialog>
	);
}
