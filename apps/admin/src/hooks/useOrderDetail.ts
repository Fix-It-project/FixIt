import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { AdminOrderDetail } from "@/types";

export function useOrderDetail(id: string | null) {
	return useQuery({
		queryKey: ["order", id],
		enabled: !!id,
		queryFn: async () => {
			const { data } = await apiClient.get<{ data: AdminOrderDetail }>(
				`/api/admin/orders/${id}`,
			);
			return data.data;
		},
	});
}
