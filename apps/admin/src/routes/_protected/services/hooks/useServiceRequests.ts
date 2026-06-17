import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { AdminServiceRequest } from "@/types";

const KEY = ["service-requests"] as const;

export interface ServiceRequestsCounts {
	pending: number;
	decided: number;
}

export interface ServiceRequestsParams {
	page: number;
	pageSize: number;
	status: "pending" | "decided";
}

interface ServiceRequestsResponse {
	data: AdminServiceRequest[];
	total: number;
	counts: ServiceRequestsCounts;
}

export function useServiceRequests(params: ServiceRequestsParams) {
	return useQuery({
		queryKey: [...KEY, params],
		placeholderData: keepPreviousData,
		queryFn: async () => {
			const { data } = await apiClient.get<ServiceRequestsResponse>(
				"/api/admin/service-requests",
				{
					params: {
						page: params.page,
						pageSize: params.pageSize,
						status: params.status,
					},
				},
			);
			return data;
		},
	});
}

export function useApproveServiceRequest() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			const { data } = await apiClient.patch(
				`/api/admin/service-requests/${id}/approve`,
			);
			return data.data;
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
	});
}

export function useRejectServiceRequest() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
			const { data } = await apiClient.patch(
				`/api/admin/service-requests/${id}/reject`,
				{ reason },
			);
			return data.data;
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
	});
}
