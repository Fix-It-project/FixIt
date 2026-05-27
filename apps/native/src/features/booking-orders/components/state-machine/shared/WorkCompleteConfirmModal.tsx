// Phase 4c Plan 06 — WorkCompleteConfirmModal (replaces 04c-03 stub).
//
// Dual-variant modal used by both sides of the dual-confirm flow:
//   variant="user"       → calls useUserConfirmCompletion
//   variant="technician" → calls useTechConfirmCompletion
//
// Binary confirmation: use AlertDialog, not Dialog.

import Toast from "react-native-toast-message";
import { AlertDialog } from "@/src/components/ui/alert-dialog";
import { Button } from "@/src/components/ui/button";
import {
	useTechConfirmCompletion,
	useUserConfirmCompletion,
} from "@/src/features/booking-orders/hooks";

export type WorkCompleteConfirmModalVariant = "user" | "technician";

interface Props {
	readonly visible: boolean;
	readonly onClose: () => void;
	readonly variant: WorkCompleteConfirmModalVariant;
	readonly orderId: string;
}

export default function WorkCompleteConfirmModal({
	visible,
	onClose,
	variant,
	orderId,
}: Props) {
	const userMutation = useUserConfirmCompletion();
	const techMutation = useTechConfirmCompletion();
	const mutation = variant === "user" ? userMutation : techMutation;

	const title =
		variant === "user" ? "Mark work complete?" : "Confirm work complete";
	const body =
		variant === "user"
			? "Confirm the technician finished the job before paying."
			: "User marked the work complete. Confirm so they can pay.";

	const handleConfirm = () => {
		mutation.mutate(
			{ orderId },
			{
				onSuccess: () => {
					onClose();
				},
				onError: (err) => {
					Toast.show({
						type: "info",
						text1: "Action failed",
						text2: err instanceof Error ? err.message : "Please try again.",
					});
				},
			},
		);
	};

	return (
		<AlertDialog visible={visible} onClose={onClose}>
			<AlertDialog.Header>{title}</AlertDialog.Header>
			<AlertDialog.Body>{body}</AlertDialog.Body>
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
