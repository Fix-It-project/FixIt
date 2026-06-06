import { useQuery } from "@tanstack/react-query";
import { getBookedSlots } from "@/src/features/schedule/api/calendar";

/**
 * Slots already taken by blocking orders for a technician, optionally within a
 * date range. Lets the booking time-slot grid gray out booked hours. The
 * "blocking" status set lives in the DB (order_status_blocks) — see the server
 * rpc_technician_booked_slots.
 */
export function useBookedSlots(
	technicianId: string | null | undefined,
	range?: { from?: string; to?: string },
) {
	const { data, isLoading } = useQuery({
		queryKey: [
			"technician-calendar",
			"booked",
			technicianId,
			range?.from ?? null,
			range?.to ?? null,
		],
		queryFn: () => getBookedSlots(technicianId!, range),
		enabled: !!technicianId,
	});

	return { bookedSlots: data ?? [], isLoading };
}
