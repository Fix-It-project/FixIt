import CancelReasonModal from "@/src/features/booking-orders/components/shared/CancelReasonModal";

interface Props {
  readonly visible: boolean;
  readonly clientName: string | null | undefined;
  readonly reason: string;
  readonly onReasonChange: (text: string) => void;
  readonly onClose: () => void;
  readonly onConfirm: () => void;
  readonly isLoading: boolean;
}

export default function BookingCancelModal({
  visible,
  clientName,
  reason,
  onReasonChange,
  onClose,
  onConfirm,
  isLoading,
}: Props) {
  return (
    <CancelReasonModal
      visible={visible}
      title="Cancel Booking"
      subjectRole="booking"
      subjectName={clientName}
      subjectFallback="this client"
      reason={reason}
      onReasonChange={onReasonChange}
      onClose={onClose}
      onConfirm={onConfirm}
      isLoading={isLoading}
      confirmLabel="Cancel Booking"
    />
  );
}
