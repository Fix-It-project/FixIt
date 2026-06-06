import NewBooking from "@/src/features/newbooking/NewBooking";

// Single-screen booking: pick an available date + time slot for the chosen
// service, then confirm. Replaces the old date → time → details step stack.
export default function BookingScreen() {
	return <NewBooking />;
}
