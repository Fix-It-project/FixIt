import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/src/stores/auth-store";
import { getTechnicianBookings } from "../api/technician-bookings";
import type { TechnicianBooking } from "../schemas/response.schema";

const VISIBLE_BOOKING_STATUSES = new Set([
  "accepted",
  "cancelled_by_user",
  "cancelled_by_technician",
]);

export function useTechnicianBookingsQuery() {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: ["technician-bookings", user?.id],
    queryFn: () => {
      if (!user?.id) throw new Error("User not authenticated");
      return getTechnicianBookings(user.id);
    },
    enabled: !!user?.id,
    refetchInterval: 60_000,
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
      if (booking.status === "accepted") dates.add(booking.scheduled_date);
    }
    return dates;
  }, [query.data]);

  return { ...query, data };
}

export function usePastTechnicianBookings() {
  const query = useTechnicianBookingsQuery();
  const pastStatuses = new Set([
    "completed",
    "cancelled_by_user",
    "cancelled_by_technician",
  ]);

  const data = useMemo(
    () => (query.data ?? []).filter((booking) => pastStatuses.has(booking.status)),
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
