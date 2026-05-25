// Phase 4c Plan 06 — CashConfirmModal (user side, net-new).
//
// Shown when the user wants to confirm they paid in cash.
// Calls useUserConfirmCompletion per 4a reality — there is no /confirm-paid
// endpoint; both sides route through confirm-completion.
//
// Migrated to declarative <Dialog> in Phase 11 Plan 07.

import Toast from "react-native-toast-message";
import { Button } from "@/src/components/ui/button";
import { Dialog } from "@/src/components/ui/dialog";
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
		<Dialog visible={visible} onClose={onClose} dismissible={false}>
			<Dialog.Header>Confirm cash payment</Dialog.Header>
			<Dialog.Body>{`Confirm you paid ${amount} EGP in cash`}</Dialog.Body>
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
