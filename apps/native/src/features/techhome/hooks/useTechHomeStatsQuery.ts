import { useQuery } from "@tanstack/react-query";
import { getTechHomeStats } from "../api/tech-home";
import { techHomeKeys } from "../schemas/query-keys";

export function useTechHomeStatsQuery() {
	return useQuery({
		queryKey: techHomeKeys.stats,
		queryFn: getTechHomeStats,
	});
}
