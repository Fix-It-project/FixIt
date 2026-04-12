import CancelReasonModal from "@/src/features/booking-orders/components/shared/CancelReasonModal";

interface Props {
	readonly visible: boolean;
	readonly technicianName: string | null | undefined;
	readonly reason: string;
	readonly onReasonChange: (text: string) => void;
	readonly onClose: () => void;
	readonly onConfirm: () => void;
	readonly isLoading: boolean;
}

export default function OrderCancelModal({
	visible,
	technicianName,
	reason,
	onReasonChange,
	onClose,
	onConfirm,
	isLoading,
}: Props) {
	return (
		<CancelReasonModal
			visible={visible}
			title="Cancel Order"
			subjectRole="order"
			subjectName={technicianName}
			subjectFallback="this technician"
			reason={reason}
			onReasonChange={onReasonChange}
			onClose={onClose}
			onConfirm={onConfirm}
			isLoading={isLoading}
			confirmLabel="Cancel Order"
		/>
	);
}
