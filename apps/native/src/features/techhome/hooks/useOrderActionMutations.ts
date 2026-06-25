import { useMutation, useQueryClient } from "@tanstack/react-query";
import { countMetric, METRICS } from "@/src/lib/metrics";
import { acceptOrder, declineOrder } from "../api/tech-home";
import { techHomeKeys } from "../schemas/query-keys";

export function useInvalidateOrderCaches() {
	const queryClient = useQueryClient();
	return () => {
		queryClient.invalidateQueries({ queryKey: techHomeKeys.orders });
		// Old dashboard feature still exists on disk — keep its cache honest too.
		queryClient.invalidateQueries({
			queryKey: techHomeKeys.legacyDashboardOrders,
		});
		queryClient.invalidateQueries({
			queryKey: techHomeKeys.scheduleEvents,
		});
		queryClient.invalidateQueries({ queryKey: techHomeKeys.stats });
	};
}

export function useAcceptOrderMutation() {
	const invalidate = useInvalidateOrderCaches();
	return useMutation({
		mutationFn: (orderId: string) => acceptOrder(orderId),
		onSuccess: () => {
			countMetric(METRICS.techRequestAction, 1, {
				attributes: { action: "accept" },
			});
			invalidate();
		},
	});
}

export function useDeclineOrderMutation() {
	const invalidate = useInvalidateOrderCaches();
	return useMutation({
		mutationFn: ({ orderId, reason }: { orderId: string; reason?: string }) =>
			declineOrder(orderId, reason),
		onSuccess: () => {
			countMetric(METRICS.techRequestAction, 1, {
				attributes: { action: "decline" },
			});
			invalidate();
		},
	});
}
