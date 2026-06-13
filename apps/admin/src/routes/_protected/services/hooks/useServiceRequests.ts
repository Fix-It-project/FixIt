import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { AdminServiceRequest } from "@/types";

const KEY = ["service-requests"] as const;

export function useServiceRequests() {
	return useQuery({
		queryKey: KEY,
		queryFn: async () => {
			const { data } = await apiClient.get<{ data: AdminServiceRequest[] }>(
				"/api/admin/service-requests",
			);
			return data.data;
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
