import { useQuery } from "@tanstack/react-query";
import { getTechnicianSelf } from "@/src/features/tech-self/api/tech-self";

export function useTechSelfProfileQuery() {
	return useQuery({
		queryKey: ["technician", "self"],
		queryFn: getTechnicianSelf,
		staleTime: 5 * 60 * 1000,
	});
}
