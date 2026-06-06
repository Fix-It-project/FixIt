import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { AdminTechnician, AdminTechnicianHistory } from "@/types";

const KEY = ["technicians"] as const;

export function useTechnicians() {
	return useQuery({
		queryKey: KEY,
		queryFn: async () => {
			const { data } = await apiClient.get<{ data: AdminTechnician[] }>(
				"/api/admin/technicians",
			);
			return data.data;
		},
	});
}

/** One technician's order history — loaded lazily on the detail page. */
export function useTechnicianHistory(id: string | null) {
	return useQuery({
		queryKey: ["technician", id, "history"],
		enabled: !!id,
		queryFn: async () => {
			const { data } = await apiClient.get<{ data: AdminTechnicianHistory[] }>(
				`/api/admin/technicians/${id}/history`,
			);
			return data.data;
		},
	});
}

export function useBlockTechnician() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
			const { data } = await apiClient.patch<{ data: AdminTechnician }>(
				`/api/admin/technicians/${id}/block`,
				{ reason },
			);
			return data.data;
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
	});
}

export function useUnblockTechnician() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			const { data } = await apiClient.patch<{ data: AdminTechnician }>(
				`/api/admin/technicians/${id}/unblock`,
			);
			return data.data;
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
	});
}

export function useVerifyTechnician() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			const { data } = await apiClient.patch<{ data: AdminTechnician }>(
				`/api/admin/technicians/${id}/verify`,
			);
			return data.data;
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
	});
}

export function useRejectTechnician() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			const { data } = await apiClient.patch<{ data: AdminTechnician }>(
				`/api/admin/technicians/${id}/reject`,
			);
			return data.data;
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
	});
}
