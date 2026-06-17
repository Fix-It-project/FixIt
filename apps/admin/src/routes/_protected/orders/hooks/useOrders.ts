import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { AdminOrder, OrdersCounts, OrdersListParams } from "@/types";

interface OrdersListResponse {
	data: AdminOrder[];
	total: number;
	counts: OrdersCounts;
}

/** Build the query string the server expects, dropping an empty search. */
function toQuery(params: OrdersListParams) {
	return {
		page: params.page,
		pageSize: params.pageSize,
		status: params.status,
		date: params.date,
		amount: params.amount,
		...(params.search.trim() ? { search: params.search.trim() } : {}),
	};
}

/** Server-side admin orders list: pagination + filters + per-chip counts. */
export function useOrders(params: OrdersListParams) {
	return useQuery({
		queryKey: ["orders", "list", params],
		placeholderData: keepPreviousData,
		queryFn: async () => {
			const { data } = await apiClient.get<OrdersListResponse>(
				"/api/admin/orders",
				{ params: toQuery(params) },
			);
			return data;
		},
	});
}

/** Fetch the full filtered set (no pagination) for CSV export. */
export async function fetchOrdersForExport(
	params: OrdersListParams,
): Promise<AdminOrder[]> {
	const { data } = await apiClient.get<{ data: AdminOrder[] }>(
		"/api/admin/orders/export",
		{ params: toQuery(params) },
	);
	return data.data;
}
