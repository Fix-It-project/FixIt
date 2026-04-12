import type { TechnicianOrder } from "@/src/features/schedule/schemas/response.schema";
import DetailHeader from "@/src/features/booking-orders/components/shared/DetailHeader";

interface Props {
	readonly booking: TechnicianOrder;
	readonly onBack: () => void;
}

export default function BookingDetailHeader({ booking, onBack }: Props) {
	return <DetailHeader categoryId={booking.category_id} onBack={onBack} title="Booking Details" />;
}
