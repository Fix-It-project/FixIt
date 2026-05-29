import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { AdminOrder } from "@/types";

export function useOrders() {
	return useQuery({
		queryKey: ["orders", "list"],
		queryFn: async () => {
			const { data } = await apiClient.get<{ data: AdminOrder[] }>(
				"/api/admin/orders",
			);
			return data.data;
		},
	});
}
