import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useAuthStore } from "@/src/stores/auth-store";
import { getTechnicianBookings } from "../api/technician-bookings";
import { TERMINAL_STATUSES } from "../schemas/order-status.schema";
import { orderQueryKeys } from "../schemas/query-keys";
import type { TechnicianBooking } from "../schemas/response.schema";

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
	});
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
