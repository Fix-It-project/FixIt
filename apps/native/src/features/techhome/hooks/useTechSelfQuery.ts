import { useQuery } from "@tanstack/react-query";
import { getTechHomeSelf } from "../api/tech-home";
import { techHomeKeys } from "../schemas/query-keys";

/**
 * Self profile for the hero header. Shares the tech-self feature's
 * ["technician", "self"] cache — schema mirrored, see schemas/profile.schema.ts.
 */
export function useTechSelfQuery() {
	return useQuery({
		queryKey: techHomeKeys.self,
		queryFn: getTechHomeSelf,
	});
}
