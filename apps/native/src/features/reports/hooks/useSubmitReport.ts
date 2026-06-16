import { useMutation, useQueryClient } from "@tanstack/react-query";
import { USER_ORDERS_KEY } from "@/src/features/booking-orders/hooks/useUserOrders";
import { orderQueryKeys } from "@/src/features/booking-orders/schemas/query-keys";
import { type SubmitReportInput, submitReport } from "../api/reports";
import type { ReportViewer } from "../constants/labels";

/** Submit a report as the given viewer. On success the order lists are
 *  invalidated so `has_open_report` refreshes (the entry shows "Reported"). */
export function useSubmitReport(viewer: ReportViewer) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: SubmitReportInput) => submitReport(viewer, input),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey:
					viewer === "technician"
						? orderQueryKeys.technicianBookings
						: USER_ORDERS_KEY,
			});
		},
	});
}
