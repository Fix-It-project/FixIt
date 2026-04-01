import { useMemo } from "react";
import { useTechnicianOrdersQuery } from "./useCalendar";
import type { TechnicianOrder } from "@/src/services/tech-calendar/schemas/response.schema";

/**
 * Returns accepted orders for a specific date.
 * Derives from the single technician-orders query (no extra API call).
 */
export function useTechBookingsQuery(dateString: string) {
  const query = useTechnicianOrdersQuery();
  const bookings = useMemo(
    () =>
      (query.data ?? []).filter(
        (o: TechnicianOrder) =>
          o.status === "accepted" && o.scheduled_date === dateString,
      ),
    [query.data, dateString],
  );
  return { ...query, data: bookings };
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
