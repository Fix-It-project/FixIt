import { useMemo } from "react";
import type { Order } from "@/src/features/booking-orders/schemas/response.schema";
import { useUserOrdersQuery } from "./useUserOrders";

export interface UserRescheduleRequest {
	readonly order: Order;
	/** `incoming` = the technician proposed it (user must approve/reject);
	 *  `sent` = the user proposed it (user can withdraw). */
	readonly direction: "incoming" | "sent";
}

/**
 * Buckets the user's orders that have a pending reschedule request, mirroring
 * the technician-side `useRescheduleJobs()`. Client-side filter over the single
 * `useUserOrdersQuery()` — no extra fetch; per-order detail is loaded lazily by
 * `RescheduleRequestPanel` via `useOrderRescheduleQuery`.
 */
export function useUserRescheduleRequests() {
	const query = useUserOrdersQuery();
	const { incoming, sent } = useMemo(() => {
		const inc: UserRescheduleRequest[] = [];
		const out: UserRescheduleRequest[] = [];
		for (const order of query.data ?? []) {
			if (order.status === "reschedule_requested_by_technician") {
				inc.push({ order, direction: "incoming" });
			} else if (order.status === "reschedule_requested_by_user") {
				out.push({ order, direction: "sent" });
			}
		}
		return { incoming: inc, sent: out };
	}, [query.data]);

	return {
		...query,
		incoming,
		sent,
		total: incoming.length + sent.length,
	};
}
