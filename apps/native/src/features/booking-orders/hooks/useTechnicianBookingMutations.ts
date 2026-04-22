import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTechnicianBookingStatus } from "../api/technician-bookings";
import type { TechnicianBooking } from "../schemas/response.schema";

function useBookingStatusMutation(
	mutationFn: (args: any) => Promise<TechnicianBooking>,
) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["technician-bookings"] });
			queryClient.invalidateQueries({ queryKey: ["schedule-events"] });
			queryClient.invalidateQueries({ queryKey: ["dashboard-orders"] });
		},
	});
}

export function useCancelTechnicianBookingMutation() {
	return useBookingStatusMutation(
		({ orderId, reason }: { orderId: string; reason?: string }) =>
			updateTechnicianBookingStatus(orderId, "cancelled_by_technician", reason),
	);
}

export function useCompleteTechnicianBookingMutation() {
	return useBookingStatusMutation((orderId: string) =>
		updateTechnicianBookingStatus(orderId, "completed"),
	);
}
