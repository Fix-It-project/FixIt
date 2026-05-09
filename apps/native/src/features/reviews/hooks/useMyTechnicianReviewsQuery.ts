import { useInfiniteQuery } from "@tanstack/react-query";
import { getMyTechnicianReviews } from "@/src/features/reviews/api/reviews";

export function useMyTechnicianReviewsQuery(pageSize = 20) {
	return useInfiniteQuery({
		queryKey: ["my-technician-reviews", pageSize],
		queryFn: ({ pageParam = 0 }) =>
			getMyTechnicianReviews({ limit: pageSize, offset: pageParam as number }),
		initialPageParam: 0,
		getNextPageParam: (lastPage, allPages) =>
			lastPage.reviews.length < pageSize ? undefined : allPages.length * pageSize,
		staleTime: 2 * 60 * 1000,
		retry: 1,
	});
}
