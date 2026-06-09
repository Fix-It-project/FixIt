// Phase 4c Plan 06 — CashConfirmModal (user side, net-new).
//
// Shown when the user wants to confirm they paid in cash.
// Calls useUserConfirmCompletion per 4a reality — there is no /confirm-paid
// endpoint; both sides route through confirm-completion.
//
// Binary confirmation: use AlertDialog, not Dialog.

import { useTranslation } from "react-i18next";
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
	const { t } = useTranslation("orders");
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
						type: "info",
						text1: t("detail.cash.confirmFailed"),
						text2:
							err instanceof Error ? err.message : t("detail.cash.tryAgain"),
					});
				},
			},
		);
	};

	return (
		<AlertDialog visible={visible} onClose={onClose}>
			<AlertDialog.Header>{t("detail.cash.title")}</AlertDialog.Header>
			<AlertDialog.Body>
				{t("detail.cash.body", { amount })}
			</AlertDialog.Body>
			<AlertDialog.Footer>
				<Button
					variant="secondary"
					onPress={onClose}
					disabled={mutation.isPending}
				>
					{t("detail.cash.cancel")}
				</Button>
				<Button
					variant="primary"
					onPress={handleConfirm}
					loading={mutation.isPending}
				>
					{t("detail.cash.confirm")}
				</Button>
			</AlertDialog.Footer>
		</AlertDialog>
	);
}
