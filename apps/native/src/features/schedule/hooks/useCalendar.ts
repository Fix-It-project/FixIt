import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import {
	createException,
	deleteException,
	getExceptions,
} from "@/src/features/schedule/api/calendar";
import { useAuthStore } from "@/src/stores/auth-store";

// ─── Templates (recurring weekly schedule) ────────────────────────────────────
// Canonical definitions live in useTemplates.ts — re-exported here so that
// existing import sites (e.g. ScheduleScreen) keep working without changes.
export { useSaveTemplatesMutation, useTemplatesQuery } from "./useTemplates";

// ─── Exceptions (single-day unavailability overrides) ────────────────────────

export function useExceptionsQuery() {
	const user = useAuthStore((s) => s.user);

	return useQuery({
		queryKey: ["technician-exceptions", user?.id],
		queryFn: () => {
			if (!user?.id) throw new Error("User not authenticated");
			return getExceptions(user.id);
		},
		enabled: !!user?.id,
	});
}

export function useAddExceptionMutation() {
	const queryClient = useQueryClient();
	const user = useAuthStore((s) => s.user);

	return useMutation({
		mutationFn: async (date: string) => {
			const technicianId = user?.id;
			if (!technicianId) throw new Error("Not authenticated");
			return createException(technicianId, { date });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["technician-exceptions", user?.id],
			});
		},
	});
}

export function useDeleteExceptionMutation() {
	const queryClient = useQueryClient();
	const user = useAuthStore((s) => s.user);

	return useMutation({
		mutationFn: async (exceptionId: string) => {
			const technicianId = user?.id;
			if (!technicianId) throw new Error("Not authenticated");
			return deleteException(technicianId, exceptionId);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["technician-exceptions", user?.id],
			});
		},
	});
}
