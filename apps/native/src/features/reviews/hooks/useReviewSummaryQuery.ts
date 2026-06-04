import { useQuery } from "@tanstack/react-query";
import { getReviewSummary } from "@/src/features/reviews/api/reviews";
import { reviewQueryKeys } from "@/src/features/reviews/query-keys";
import type { ReviewSummary } from "@/src/features/reviews/schemas/review.schema";

/**
 * Aggregate rating summary (avg, count, per-star distribution) for a technician.
 * Backs the detail page Reviews-tab distribution bars with real backend data.
 */
export function useReviewSummaryQuery(technicianId: string | null) {
	return useQuery<ReviewSummary>({
		queryKey: reviewQueryKeys.summary(technicianId),
		queryFn: () => getReviewSummary(technicianId!),
		enabled: !!technicianId,
		staleTime: 5 * 60 * 1000,
		retry: 1,
	});
}
