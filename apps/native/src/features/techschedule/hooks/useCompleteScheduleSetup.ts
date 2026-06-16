import { useMutation, useQueryClient } from "@tanstack/react-query";
import { completeScheduleSetup } from "../api/schedule-setup";

/**
 * Minimal shape of the shared `["technician","self"]` cache entry we touch. Lets
 * us flip the onboarding gate in place without a cross-feature import of
 * tech-self's profile type.
 */
type SelfProfileCache = {
	schedule_setup_completed_at?: string | null;
} & Record<string, unknown>;

/**
 * Marks first-time schedule setup complete. Stamps the cached technician-self
 * profile in place immediately (so the schedule route swaps onboarding → the
 * normal SchedulePage with no refetch race), then invalidates to reconcile with
 * the server. Idempotent server-side — re-saving never un-stamps.
 */
export function useCompleteScheduleSetup() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: completeScheduleSetup,
		onSuccess: () => {
			queryClient.setQueryData<SelfProfileCache>(
				["technician", "self"],
				(old) =>
					old
						? {
								...old,
								schedule_setup_completed_at:
									old.schedule_setup_completed_at ?? new Date().toISOString(),
							}
						: old,
			);
			queryClient.invalidateQueries({ queryKey: ["technician", "self"] });
		},
	});
}
