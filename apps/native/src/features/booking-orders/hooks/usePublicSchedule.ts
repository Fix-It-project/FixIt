import { useQuery } from '@tanstack/react-query';
import { getPublicSchedule } from '@/src/features/schedule/api/calendar';

export function useTechnicianPublicSchedule(technicianId: string | null) {
  const { data, isLoading } = useQuery({
    queryKey: ['public-schedule', technicianId],
    queryFn: () => getPublicSchedule(technicianId!),
    enabled: !!technicianId,
  });

  return {
    templates: data?.templates ?? [],
    exceptions: data?.exceptions ?? [],
    isLoading,
  };
}