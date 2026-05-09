import { useQuery } from "@tanstack/react-query";
import { getTechnicianReviews } from "@/src/features/reviews/api/reviews";
import type { TechnicianReviewsResponse } from "@/src/features/reviews/schemas/review.schema";

/**
 * Fetches paginated reviews for a specific technician (user-auth).
 *
 * Lives in `src/hooks/` because it is consumed by multiple features
 * (technicians profile sheet preview + reviews routes).
 */
export function useTechnicianReviewsQuery(
  technicianId: string | null,
  limit = 20,
  offset = 0,
) {
  return useQuery<TechnicianReviewsResponse>({
    queryKey: ["technician-reviews", technicianId, limit, offset],
    queryFn: async () => {
      try {
        return await getTechnicianReviews(technicianId!, { limit, offset });
      } catch (error) {
        console.warn("[useTechnicianReviewsQuery] API error:", error);
        throw error;
      }
    },
    enabled: !!technicianId,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
}
