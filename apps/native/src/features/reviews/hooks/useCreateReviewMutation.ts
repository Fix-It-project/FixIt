import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createReview } from "@/src/features/reviews/api/reviews";
import type { CreateReviewClientInput } from "@/src/features/reviews/schemas/review.schema";

/**
 * Mutation hook for POST /api/reviews.
 *
 * On success, invalidates:
 *   - ["technician-reviews", technicianId, ...]  — user-side technician review list
 *   - ["technician-profile", technicianId]        — profile aggregate stats (avg_rating)
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
			// Invalidate all paginated slices of this technician's reviews
			queryClient.invalidateQueries({
				queryKey: ["technician-reviews", technicianId],
			});
			// Invalidate profile so avg_rating/review_count refresh
			queryClient.invalidateQueries({
				queryKey: ["technician-profile", technicianId],
			});
		},
	});
}
