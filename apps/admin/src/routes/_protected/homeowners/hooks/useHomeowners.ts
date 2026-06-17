import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { AdminHomeowner, HomeownerOrderHistory } from "@/types";

const KEY = ["homeowners"] as const;

export function useHomeowners() {
	return useQuery({
		queryKey: KEY,
		queryFn: async () => {
			const { data } = await apiClient.get<{ data: AdminHomeowner[] }>(
				"/api/admin/homeowners",
			);
			return data.data;
		},
	});
}

/** One homeowner's order history — loaded lazily on the detail page. */
export function useHomeownerHistory(id: string | null) {
	return useQuery({
		queryKey: ["homeowner", id, "history"],
		enabled: !!id,
		queryFn: async () => {
			const { data } = await apiClient.get<{ data: HomeownerOrderHistory[] }>(
				`/api/admin/homeowners/${id}/history`,
			);
			return data.data;
		},
	});
}

export function useBlockHomeowner() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
			const { data } = await apiClient.patch<{ data: AdminHomeowner }>(
				`/api/admin/homeowners/${id}/block`,
				{ reason },
			);
			return data.data;
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
	});
}

export function useUnblockHomeowner() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			const { data } = await apiClient.patch<{ data: AdminHomeowner }>(
				`/api/admin/homeowners/${id}/unblock`,
			);
			return data.data;
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
	});
}
