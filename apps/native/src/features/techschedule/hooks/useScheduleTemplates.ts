import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createTemplate,
	getTemplates,
	updateTemplate,
} from "@/src/lib/technician-calendar";
import { useAuthStore } from "@/src/stores/auth-store";

const templatesKey = (userId: string | undefined) =>
	["technician-templates", userId] as const;

export function useScheduleTemplatesQuery() {
	const user = useAuthStore((s) => s.user);
	return useQuery({
		queryKey: templatesKey(user?.id),
		queryFn: () => {
			if (!user?.id) throw new Error("Not authenticated");
			return getTemplates(user.id);
		},
		enabled: !!user?.id,
	});
}

export interface SaveTemplateRow {
	day_of_week: number;
	slot_hour: number;
	active: boolean;
}

/**
 * Persist the weekly schedule row-by-row (create new rows, toggle changed ones).
 * Mirrors the prior row-based save — there is no bulk endpoint. Fetches fresh
 * templates first so it diffs against server truth, not a stale cache.
 */
export function useSaveScheduleTemplatesMutation() {
	const queryClient = useQueryClient();
	const user = useAuthStore((s) => s.user);

	return useMutation({
		mutationFn: async (rows: SaveTemplateRow[]) => {
			const technicianId = user?.id;
			if (!technicianId) throw new Error("Not authenticated");

			const fresh = await getTemplates(technicianId);
			const promises = rows.map((row) => {
				const existing = fresh.find(
					(e) =>
						e.day_of_week === row.day_of_week &&
						(e.slot_hour ?? 8) === row.slot_hour,
				);
				if (existing) {
					if (existing.active !== row.active) {
						return updateTemplate(technicianId, existing.id, {
							active: row.active,
						});
					}
					return Promise.resolve(existing);
				}
				return createTemplate(technicianId, {
					day_of_week: row.day_of_week,
					slot_hour: row.slot_hour,
					active: row.active,
				});
			});
			return Promise.all(promises);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: templatesKey(user?.id) });
		},
	});
}
