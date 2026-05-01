import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateDashboardOrderStatus } from "../api/dashboard-orders";

function useDashboardOrderMutation(status: "accepted" | "rejected") {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (orderId: string) =>
			updateDashboardOrderStatus(orderId, status),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["dashboard-orders"] });
			queryClient.invalidateQueries({ queryKey: ["technician-bookings"] });
			queryClient.invalidateQueries({ queryKey: ["schedule-events"] });
		},
	});
}

export function useAcceptDashboardOrderMutation() {
	return useDashboardOrderMutation("accepted");
}

export function useRejectDashboardOrderMutation() {
	return useDashboardOrderMutation("rejected");
}
