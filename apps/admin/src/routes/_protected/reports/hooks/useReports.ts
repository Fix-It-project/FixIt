import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { AdminReport } from "@/types";

const KEY = ["reports"] as const;

export function useReports() {
	return useQuery({
		queryKey: KEY,
		queryFn: async () => {
			const { data } = await apiClient.get<{ data: AdminReport[] }>(
				"/api/admin/reports",
			);
			return data.data;
		},
	});
}

/** Shared shape for the admin decision endpoints (resolve/dismiss/reopen/warn). */
function useReportAction(action: "resolve" | "dismiss" | "reopen" | "warn") {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			const { data } = await apiClient.patch(
				`/api/admin/reports/${id}/${action}`,
			);
			return data.data;
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
	});
}

export const useResolveReport = () => useReportAction("resolve");
export const useDismissReport = () => useReportAction("dismiss");
export const useReopenReport = () => useReportAction("reopen");
export const useWarnReport = () => useReportAction("warn");
