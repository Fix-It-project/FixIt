import { useQuery } from "@tanstack/react-query";
import { getTechnicianSelf } from "@/src/services/technicians/self-api";

export function useTechSelfProfileQuery() {
  return useQuery({
    queryKey: ["technician", "self"],
    queryFn: getTechnicianSelf,
    staleTime: 5 * 60 * 1000,
  });
}
