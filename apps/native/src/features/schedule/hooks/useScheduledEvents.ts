import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { RESCHEDULE_PENDING_STATUSES } from "@/src/features/booking-orders/schemas/order-status.schema";
import { useAuthStore } from "@/src/stores/auth-store";
import { getScheduledEvents } from "../api/scheduled-events";
import type { ScheduledEvent } from "../schemas/response.schema";

export function useScheduledEventsQuery() {
	const user = useAuthStore((state) => state.user);

	return useQuery({
		queryKey: ["schedule-events", user?.id],
		queryFn: () => {
			if (!user?.id) throw new Error("User not authenticated");
			return getScheduledEvents(user.id);
		},
		enabled: !!user?.id,
		refetchInterval: 60_000,
	});
}

export function useScheduledEventsByDate(): Record<string, ScheduledEvent[]> {
	const { data: events = [] } = useScheduledEventsQuery();

	return useMemo(() => {
		const map: Record<string, ScheduledEvent[]> = {};

		for (const event of events) {
			// `accepted` plus reschedule-pending: a pending reschedule keeps the
			// order on its original date until approved, so it stays on the calendar.
			if (
				event.status !== "accepted" &&
				!RESCHEDULE_PENDING_STATUSES.has(event.status)
			) {
				continue;
			}
			if (!map[event.scheduled_date]) map[event.scheduled_date] = [];
			map[event.scheduled_date].push(event);
		}

		return map;
	}, [events]);
}
