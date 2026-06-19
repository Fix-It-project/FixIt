import {
	queryOptions,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { useMemo } from "react";
import {
	cancelUserOrder,
	getUserOrders,
} from "@/src/features/booking-orders/api/orders";
import {
	type OrderStatus,
	TERMINAL_STATUSES,
} from "@/src/features/booking-orders/schemas/order-status.schema";
import type { Order } from "@/src/features/booking-orders/schemas/response.schema";

export const USER_ORDERS_KEY = ["user-orders"] as const;

// Single source of truth for the user-orders query (key + fn) so screen hooks and
// the startup prefetch share an identical key — a prefetch with a mismatched key
// silently misses the cache.
export function userOrdersQueryOptions() {
	return queryOptions({
		queryKey: USER_ORDERS_KEY,
		queryFn: async () => {
			const res = await getUserOrders();
			return res.data;
		},
	});
}

export function useUserOrdersQuery() {
	return useQuery(userOrdersQueryOptions());
}

export function useUserOrderById(orderId: string): Order | undefined {
	const { data: orders = [] } = useUserOrdersQuery();
	return useMemo(() => orders.find((o) => o.id === orderId), [orders, orderId]);
}

export function useUserPastOrders() {
	const query = useUserOrdersQuery();
	// All terminal orders belong in history — not just completed + the two
	// user/tech cancellations. This also surfaces declined, no-fee/with-fee
	// cancellations, rejected, etc., each routing to the read-only summary.
	const orders = useMemo(
		() =>
			(query.data ?? []).filter((o) =>
				TERMINAL_STATUSES.has(o.status as OrderStatus),
			),
		[query.data],
	);
	return { ...query, data: orders };
}

export function useCancelOrderByUserMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ orderId, reason }: { orderId: string; reason?: string }) =>
			cancelUserOrder(orderId, reason),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: USER_ORDERS_KEY });
		},
	});
}
