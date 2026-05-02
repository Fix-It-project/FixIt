import { useInfiniteQuery } from "@tanstack/react-query";
import { getTechnicianReviews } from "@/src/features/reviews/api/reviews";

export function useTechnicianReviewsInfiniteQuery(
  technicianId: string | null,
  pageSize = 20,
) {
  return useInfiniteQuery({
    queryKey: ["technician-reviews-infinite", technicianId, pageSize],
    queryFn: ({ pageParam = 0 }) =>
      getTechnicianReviews(technicianId!, { limit: pageSize, offset: pageParam as number }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.reviews.length < pageSize ? undefined : allPages.length * pageSize,
    enabled: !!technicianId,
    staleTime: 2 * 60 * 1000,
  });
}
