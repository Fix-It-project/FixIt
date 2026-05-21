import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useAuthStore } from "@/src/stores/auth-store";
import { getTechnicianBookings } from "../api/technician-bookings";
import {
	ACTIVE_STATUSES,
	RESCHEDULE_PENDING_STATUSES,
	TERMINAL_STATUSES,
} from "../schemas/order-status.schema";
import { orderQueryKeys } from "../schemas/query-keys";
import type { TechnicianBooking } from "../schemas/response.schema";

// The technician's bookings list shows every booking that is *not* terminal —
// i.e. accepted, tracking, arrived_inspection, awaiting_final_cost,
// negotiating, in_progress, awaiting_payment, plus the reschedule-pending
// statuses (the order keeps its original date until the request resolves) —
// plus past cancellations on the scheduled date so the tech sees a clear
// "this one was cancelled" trail.
// Previously this set was just `{accepted, cancelled_by_user,
// cancelled_by_technician}`, so any order that moved past `accepted` (e.g.
// `tracking`, or a pending reschedule) silently dropped off the home list.
const VISIBLE_BOOKING_STATUSES = new Set<string>([
	...ACTIVE_STATUSES,
	...RESCHEDULE_PENDING_STATUSES,
	"cancelled_by_user",
	"cancelled_by_technician",
]);

// Past statuses for the "history" tab — everything terminal.
const PAST_BOOKING_STATUSES: ReadonlySet<string> = TERMINAL_STATUSES;

export function useTechnicianBookingsQuery() {
	const user = useAuthStore((state) => state.user);

	return useQuery({
		queryKey: orderQueryKeys.technicianBookingsFor(user?.id),
		queryFn: () => {
			if (!user?.id) throw new Error("User not authenticated");
			return getTechnicianBookings(user.id);
		},
		enabled: !!user?.id,
		refetchInterval: 10_000,
		refetchIntervalInBackground: false,
	});
}

export function useVisibleTechnicianBookings(dateString: string) {
	const query = useTechnicianBookingsQuery();

	const data = useMemo(
		() =>
			(query.data ?? []).filter(
				(booking) =>
					VISIBLE_BOOKING_STATUSES.has(booking.status) &&
					booking.scheduled_date === dateString,
			),
		[query.data, dateString],
	);

	return { ...query, data };
}

export function useTechnicianBookingDates() {
	const query = useTechnicianBookingsQuery();

	const data = useMemo(() => {
		const dates = new Set<string>();
		for (const booking of query.data ?? []) {
			// Paint a date pill whenever the tech has any active booking on
			// that day — not just `accepted`. Otherwise a tracking/in-progress
			// booking would leave its date blank in the calendar.
			if (VISIBLE_BOOKING_STATUSES.has(booking.status)) {
				dates.add(booking.scheduled_date);
			}
		}
		return dates;
	}, [query.data]);

	return { ...query, data };
}

export function usePastTechnicianBookings() {
	const query = useTechnicianBookingsQuery();

	const data = useMemo(
		() =>
			(query.data ?? []).filter((booking) =>
				PAST_BOOKING_STATUSES.has(booking.status),
			),
		[query.data],
	);

	return { ...query, data };
}

export function useTechnicianBookingById(
	orderId: string,
): TechnicianBooking | undefined {
	const { data: bookings = [] } = useTechnicianBookingsQuery();

	return useMemo(
		() => bookings.find((booking) => booking.id === orderId),
		[bookings, orderId],
	);
}
