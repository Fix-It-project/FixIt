import { useInfiniteQuery } from "@tanstack/react-query";
import { getTechnicianReviews } from "@/src/features/reviews/api/reviews";
import { reviewQueryKeys } from "@/src/features/reviews/query-keys";

export function useTechnicianReviewsInfiniteQuery(
	technicianId: string | null,
	pageSize = 20,
) {
	return useInfiniteQuery({
		queryKey: reviewQueryKeys.technicianInfinite(technicianId, pageSize),
		queryFn: ({ pageParam = 0 }) => {
			if (!technicianId) throw new Error("technicianId is required");
			return getTechnicianReviews(technicianId, {
				limit: pageSize,
				offset: pageParam as number,
			});
		},
		initialPageParam: 0,
		getNextPageParam: (lastPage, allPages) =>
			lastPage.reviews.length < pageSize
				? undefined
				: allPages.length * pageSize,
		enabled: !!technicianId,
		staleTime: 2 * 60 * 1000,
	});
}
