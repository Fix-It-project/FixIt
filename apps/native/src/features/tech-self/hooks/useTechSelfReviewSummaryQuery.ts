import { useQuery } from "@tanstack/react-query";
import { getTechnicianSelfReviewSummary } from "@/src/features/tech-self/api/tech-self";

/**
 * The authenticated technician's OWN rating summary (avg, count, per-star
 * distribution) via the technician-auth route. Lazily enabled — only fetched
 * when the rating distribution sheet is opened.
 */
export function useTechSelfReviewSummaryQuery(enabled: boolean) {
	return useQuery({
		queryKey: ["technician", "self", "review-summary"],
		queryFn: getTechnicianSelfReviewSummary,
		enabled,
		staleTime: 5 * 60 * 1000,
	});
}
