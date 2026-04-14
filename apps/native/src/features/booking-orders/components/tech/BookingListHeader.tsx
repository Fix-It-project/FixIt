import { forwardRef } from "react";
import ScheduleBookingsHeader, {
	type ScheduleBookingsHeaderRef,
} from "@/src/features/schedule/components/tech/ScheduleBookingsHeader";

/**
 * Bookings page header.
 *
 * Contains: back button, title bar, online badge, bell icon,
 * schedule/bookings toggle (bookings active, schedule no-op),
 * the week strip, and the "Jump" button.
 */
export type BookingsHeaderRef = ScheduleBookingsHeaderRef;

const BookingsHeader = forwardRef<BookingsHeaderRef, object>(function BookingListHeader(_, ref) {
	return <ScheduleBookingsHeader ref={ref} activeView="bookings" onToggle={() => {}} />;
});

export default BookingsHeader;
