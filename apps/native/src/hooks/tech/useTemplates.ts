import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTemplates, createTemplate, updateTemplate } from '@/src/services/tech-calendar/api/calendar';
import { useAuthStore } from '@/src/stores/auth-store';

export function useTemplatesQuery() {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ['technician-templates', user?.id],
    queryFn: () => getTemplates(user!.id),
    enabled: !!user?.id,
  });
}

export function useSaveTemplatesMutation() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async ({
      newSchedule,
    }: {
      newSchedule: { day_of_week: number; active: boolean }[];
    }) => {
      // Capture technicianId synchronously before any awaits. Referencing
      // `user.id` inside .map() callbacks after an await risks a stale
      // closure if the Zustand store value changes mid-async execution.
      const technicianId = user?.id;
      if (!technicianId) throw new Error('Not authenticated');

      // Fetch fresh templates right before diffing to avoid silently skipping
      // updates due to stale React Query cache data.
      const freshTemplates = await getTemplates(technicianId);

      const promises = newSchedule.map((daySettings) => {
        const existing = freshTemplates.find((e) => e.day_of_week === daySettings.day_of_week);

        if (existing) {
          if (existing.active !== daySettings.active) {
            return updateTemplate(technicianId, existing.id, {
              active: daySettings.active,
            });
          }
          return Promise.resolve(existing); // No change needed
        } else {
          return createTemplate(technicianId, {
            day_of_week: daySettings.day_of_week,
            active: daySettings.active,
          });
        }
      });

      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technician-templates', user?.id] });
    },
  });
}