import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patchAvailability } from "../api/tech-home";
import { techHomeKeys } from "../schemas/query-keys";

/**
 * Optimistic availability toggle against the SHARED ["technician","self"] cache
 * (owned by tech-self — see schemas/query-keys.ts for the contract). Rolls back
 * on error; global MutationCache surfaces the toast.
 */
export function useAvailabilityMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (isAvailable: boolean) => patchAvailability(isAvailable),
		onMutate: async (isAvailable) => {
			await queryClient.cancelQueries({ queryKey: techHomeKeys.self });
			const previous = queryClient.getQueryData(techHomeKeys.self);
			queryClient.setQueryData(
				techHomeKeys.self,
				(old: { is_available?: boolean } | undefined) =>
					old ? { ...old, is_available: isAvailable } : old,
			);
			return { previous };
		},
		onError: (_error, _vars, context) => {
			if (context?.previous !== undefined) {
				queryClient.setQueryData(techHomeKeys.self, context.previous);
			}
		},
		onSettled: () =>
			queryClient.invalidateQueries({ queryKey: techHomeKeys.self }),
	});
}
