import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createReview } from "@/src/features/reviews/api/reviews";
import { reviewQueryKeys } from "@/src/features/reviews/query-keys";
import type { CreateReviewClientInput } from "@/src/features/reviews/schemas/review.schema";
import { technicianQueryKeys } from "@/src/features/technicians/query-keys";

/**
 * Mutation hook for POST /api/reviews.
 *
 * On success, invalidates:
 *   - all user-side review pages for the technician
 *   - technician profile/list aggregate stats
 *   - user order review flags
 *
 * The technicianId must be passed as a variable alongside CreateReviewClientInput.
 */
export function useCreateReviewMutation() {
	const queryClient = useQueryClient();

	return useMutation<
		void,
		Error,
		{ input: CreateReviewClientInput; technicianId: string }
	>({
		mutationFn: ({ input }) => createReview(input),
		onSuccess: (_data, { technicianId }) => {
			queryClient.invalidateQueries({
				queryKey: reviewQueryKeys.technician(technicianId),
			});
			queryClient.invalidateQueries({
				queryKey: technicianQueryKeys.profile(technicianId),
			});
			queryClient.invalidateQueries({ queryKey: technicianQueryKeys.all });
			queryClient.invalidateQueries({ queryKey: ["user-orders"] });
		},
	});
}
