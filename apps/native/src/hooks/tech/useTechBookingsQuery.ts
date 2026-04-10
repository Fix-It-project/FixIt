import { useMemo } from "react";
import { useTechnicianOrdersQuery } from "./useCalendar";
import type { TechnicianOrder } from "@/src/features/schedule/schemas/response.schema";

/** Statuses that should appear on the technician bookings calendar. */
const VISIBLE_STATUSES = new Set([
  "accepted",
  "cancelled_by_user",
  "cancelled_by_technician",
]);

/**
 * Returns visible orders for a specific date (accepted + cancelled).
 * Derives from the single technician-orders query (no extra API call).
 */
export function useTechBookingsQuery(dateString: string) {
  const query = useTechnicianOrdersQuery();
  const bookings = useMemo(
    () =>
      (query.data ?? []).filter(
        (o: TechnicianOrder) =>
          VISIBLE_STATUSES.has(o.status) && o.scheduled_date === dateString,
      ),
    [query.data, dateString],
  );
  return { ...query, data: bookings };
}

/** Returns all past orders (completed + cancelled). */
export function useTechPastOrders() {
  const query = useTechnicianOrdersQuery();
  const pastStatuses = new Set(["completed", "cancelled_by_user", "cancelled_by_technician"]);
  const orders = useMemo(
    () => (query.data ?? []).filter((o) => pastStatuses.has(o.status)),
    [query.data],
  );
  return { ...query, data: orders };
}

/**
 * Returns a Set of all dates that have at least one accepted booking.
 * Used to render dot indicators on the calendar / week strip.
 */
export function useTechBookingDatesQuery() {
  const query = useTechnicianOrdersQuery();
  const dates = useMemo(() => {
    const set = new Set<string>();
    for (const o of query.data ?? []) {
      if (o.status === "accepted") set.add(o.scheduled_date);
    }
    return set;
  }, [query.data]);
  return { ...query, data: dates };
}
