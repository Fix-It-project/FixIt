import { useQuery } from "@tanstack/react-query";
import { getServicesByCategory } from "@/src/features/services/api/services";

export function useServicesQuery(categoryId: string) {
  return useQuery({
    queryKey: ["services", categoryId],
    queryFn: () => getServicesByCategory(categoryId),
    select: (data) => data.services,
    staleTime: 5 * 60 * 1000,
    enabled: !!categoryId,
  });
}
