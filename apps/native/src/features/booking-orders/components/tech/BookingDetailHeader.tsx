import DetailHeader from "@/src/features/booking-orders/components/shared/DetailHeader";
import type { TechnicianBooking } from "../../schemas/response.schema";

interface Props {
	readonly booking: TechnicianBooking;
	readonly onBack: () => void;
}

export default function BookingDetailHeader({ booking, onBack }: Props) {
	return (
		<DetailHeader
			categoryId={booking.category_id}
			onBack={onBack}
			title="Booking Details"
		/>
	);
}
