import { useQuery } from "@tanstack/react-query";
import { getUserStats } from "@/src/features/users/api/user";

/**
 * Customer profile metrics (total bookings, completed, most-booked category,
 * member-since) aggregated from the user's orders. Backs the profile hero.
 */
export function useUserStatsQuery() {
	return useQuery({
		queryKey: ["user", "stats"],
		queryFn: getUserStats,
		select: (data) => data.stats,
		staleTime: 5 * 60 * 1000,
	});
}
