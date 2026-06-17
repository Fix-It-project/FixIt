import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { AdminReport, ReportSourceFilter } from "@/types";

const KEY = ["reports"] as const;

export interface ReportsCounts {
	open: number;
	closed: number;
	all: number;
	user: number;
	technician: number;
}

export interface ReportsListParams {
	page: number;
	pageSize: number;
	status: "open" | "closed";
	source: ReportSourceFilter;
}

interface ReportsListResponse {
	data: AdminReport[];
	total: number;
	counts: ReportsCounts;
}

export function useReports(params: ReportsListParams) {
	return useQuery({
		queryKey: [...KEY, params],
		placeholderData: keepPreviousData,
		queryFn: async () => {
			const { data } = await apiClient.get<ReportsListResponse>(
				"/api/admin/reports",
				{
					params: {
						page: params.page,
						pageSize: params.pageSize,
						status: params.status,
						source: params.source,
					},
				},
			);
			return data;
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
