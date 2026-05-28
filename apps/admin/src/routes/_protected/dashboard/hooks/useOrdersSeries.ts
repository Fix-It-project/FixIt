import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { OrderSeries, Range } from "@/types";

export function useOrdersSeries(range: Range) {
	return useQuery({
		queryKey: ["dashboard", "series", range],
		queryFn: async () => {
			const { data } = await apiClient.get<{ data: OrderSeries }>(
				"/api/admin/dashboard/orders-series",
				{ params: { range } },
			);
			return data.data;
		},
	});
}
