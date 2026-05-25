// Phase 4c Plan 06 — CashReceivedModal (replaces 04c-03 stub).
//
// Tech-side modal: confirms cash received from customer.
// Auto-opened by CashReceivedActionsView when order.user_completed_at is set
// and order.technician_completed_at is null and payment_method === "cash".
// Calls useTechMarkCashReceived which sets technician_completed_at; the
// fn_dual_confirm_completion trigger then flips status to "completed".
//
// Migrated to declarative <Dialog> in Phase 11 Plan 07.

import Toast from "react-native-toast-message";
import { Button } from "@/src/components/ui/button";
import { Dialog } from "@/src/components/ui/dialog";
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
		<Dialog visible={visible} onClose={onClose} dismissible={false}>
			<Dialog.Header>Cash received?</Dialog.Header>
			<Dialog.Body>{`User confirmed payment of ${amount} EGP. Confirm you received cash?`}</Dialog.Body>
			<Dialog.Footer>
				<Button variant="secondary" onPress={onClose} disabled={mutation.isPending}>
					Cancel
				</Button>
				<Button
					variant="primary"
					onPress={handleConfirm}
					loading={mutation.isPending}
				>
					Confirm
				</Button>
			</Dialog.Footer>
		</Dialog>
	);
}
