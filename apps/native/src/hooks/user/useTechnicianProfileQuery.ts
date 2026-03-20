import { useQuery } from "@tanstack/react-query";
import { getTechnicianProfile } from "@/src/services/technicians/api/technicians";
import type { TechnicianProfile } from "@/src/services/technicians/types/technician";

/**
 * TanStack Query hook that fetches a technician's profile data.
 *
 * Only enabled when a valid `technicianId` is provided.
 * Used by the profile bottom sheet — starts fetching the moment
 * the user taps a technician's avatar.
 */
export function useTechnicianProfileQuery(technicianId: string | null) {
  return useQuery<TechnicianProfile>({
    queryKey: ["technician-profile", technicianId],
    queryFn: () => getTechnicianProfile(technicianId!),
    enabled: !!technicianId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
