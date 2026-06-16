import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { TechnicianBooking } from "@/src/schemas/technician-order.schema";
import { useAuthStore } from "@/src/stores/auth-store";
import { getTechnicianScheduleOrders } from "../api/orders";
import { SCHEDULE_VISIBLE_STATUSES } from "../constants";

/**
 * The technician's orders, sharing the ["technician-bookings", userId] cache
 * (same key + canonical parser as booking-orders/techhome). Derives the per-day
 * order map + the set of dates that have orders for the calendar.
 */
export function useTechnicianScheduleOrders() {
	const user = useAuthStore((s) => s.user);

	const query = useQuery({
		queryKey: ["technician-bookings", user?.id],
		queryFn: getTechnicianScheduleOrders,
		enabled: !!user?.id,
	});

	const ordersByDate = useMemo(() => {
		const map: Record<string, TechnicianBooking[]> = {};
		for (const order of query.data ?? []) {
			if (!SCHEDULE_VISIBLE_STATUSES.has(order.status)) continue;
			(map[order.scheduled_date] ??= []).push(order);
		}
		for (const date of Object.keys(map)) {
			map[date].sort((a, b) =>
				(a.scheduled_start_at ?? "").localeCompare(b.scheduled_start_at ?? ""),
			);
		}
		return map;
	}, [query.data]);

	const orderDates = useMemo(() => Object.keys(ordersByDate), [ordersByDate]);

	return { ...query, ordersByDate, orderDates };
}
