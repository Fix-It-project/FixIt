import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { DashboardSummary } from "@/types";

export function useDashboardSummary() {
	return useQuery({
		queryKey: ["dashboard", "summary"],
		queryFn: async () => {
			const { data } = await apiClient.get<{ data: DashboardSummary }>(
				"/api/admin/dashboard/summary",
			);
			return data.data;
		},
	});
}
