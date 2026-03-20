import { useQuery } from "@tanstack/react-query";
import { TECH_BOOKINGS } from "@/src/lib/mock-data/tech";
import type { TechBooking } from "@/src/lib/mock-data/tech";

/**
 * TanStack Query hook that returns bookings for a given date.
 *
 * Currently returns mock data. When the backend is ready, swap the
 * `queryFn` to hit the real API (same pattern as `useTechniciansQuery`).
 *
 * @param dateString  ISO date string, e.g. "2026-03-17"
 */
export function useTechBookingsQuery(dateString: string) {
  return useQuery<TechBooking[]>({
    queryKey: ["tech-bookings", dateString],
    queryFn: async () => {
      // TODO: replace with real API call
      return TECH_BOOKINGS.filter((b) => b.date === dateString);
    },
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
}

/**
 * Returns all dates that have at least one booking.
 * Used to render dot indicators on the calendar / week strip.
 */
export function useTechBookingDatesQuery() {
  return useQuery<Set<string>>({
    queryKey: ["tech-booking-dates"],
    queryFn: async () => {
      // TODO: replace with real API call
      return new Set(TECH_BOOKINGS.map((b) => b.date));
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
