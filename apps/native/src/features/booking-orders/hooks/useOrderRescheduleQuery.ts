import { useQuery } from "@tanstack/react-query";
import { userGetReschedule } from "../api/orders";
import { techGetReschedule } from "../api/technician-bookings";
import { orderQueryKeys } from "../schemas/query-keys";
import type { RescheduleRequestModel } from "../schemas/reschedule.schema";

export type RescheduleViewer = "user" | "technician";

interface UseOrderRescheduleQueryOptions {
	enabled?: boolean;
}

export function useOrderRescheduleQuery(
	orderId: string | null | undefined,
	viewer: RescheduleViewer,
	options: UseOrderRescheduleQueryOptions = {},
) {
	const fetcher = viewer === "user" ? userGetReschedule : techGetReschedule;
	return useQuery<RescheduleRequestModel | null>({
		queryKey: orderQueryKeys.orderReschedule(orderId ?? "", viewer),
		queryFn: async () => {
			if (!orderId) return null;
			const result = await fetcher(orderId);
			return result.data;
		},
		enabled: Boolean(orderId) && (options.enabled ?? true),
		staleTime: 5_000,
	});
}
