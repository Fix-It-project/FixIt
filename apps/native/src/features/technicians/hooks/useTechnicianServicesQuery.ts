import { useQuery } from "@tanstack/react-query";
import { getTechnicianServices } from "@/src/features/technicians/api/technicians";
import { technicianQueryKeys } from "@/src/features/technicians/query-keys";
import type { TechnicianService } from "@/src/features/technicians/schemas/response.schema";

/**
 * Fetches the services a specific technician offers (with price range), via the
 * per-technician technician_services catalog. Drives the detail page Services tab.
 */
export function useTechnicianServicesQuery(technicianId: string | null) {
	return useQuery<TechnicianService[]>({
		queryKey: technicianQueryKeys.services(technicianId ?? ""),
		queryFn: () => getTechnicianServices(technicianId!),
		enabled: !!technicianId,
		staleTime: 5 * 60 * 1000,
		retry: 1,
	});
}
