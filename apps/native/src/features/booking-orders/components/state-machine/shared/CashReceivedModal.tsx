// Phase 4c Plan 06 — CashReceivedModal (replaces 04c-03 stub).
//
// Tech-side modal: confirms cash received from customer.
// Auto-opened by CashReceivedActionsView when order.user_completed_at is set
// and order.technician_completed_at is null and payment_method === "cash".
// Calls useTechMarkCashReceived which sets technician_completed_at; the
// fn_dual_confirm_completion trigger then flips status to "completed".
//
// Binary confirmation: use AlertDialog, not Dialog.

import Toast from "react-native-toast-message";
import { AlertDialog } from "@/src/components/ui/alert-dialog";
import { Button } from "@/src/components/ui/button";
import { useTechMarkCashReceived } from "@/src/features/booking-orders/hooks";

interface Props {
	readonly visible: boolean;
	readonly onClose: () => void;
	readonly orderId: string;
	readonly amount: number;
}

export default function CashReceivedModal({
	visible,
	onClose,
	orderId,
	amount,
}: Props) {
	const mutation = useTechMarkCashReceived();

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
						text1: "Failed to confirm cash",
						text2: err instanceof Error ? err.message : "Please try again.",
					});
				},
			},
		);
	};

	return (
		<AlertDialog visible={visible} onClose={onClose}>
			<AlertDialog.Header>Cash received?</AlertDialog.Header>
			<AlertDialog.Body>{`User confirmed payment of ${amount} EGP. Confirm you received cash?`}</AlertDialog.Body>
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
