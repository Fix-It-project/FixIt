import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTemplates,
  createTemplate,
  updateTemplate,
  getExceptions,
  createException,
  deleteException,
  getTechnicianOrders,
} from '@/src/services/technician-calendar/api/calendar';
import type { TechnicianOrder } from '@/src/services/technician-calendar/types/calendar';
import { useAuthStore } from '@/src/stores/auth-store';

// ─── Templates (recurring weekly schedule) ────────────────────────────────────

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
      const technicianId = user?.id;
      if (!technicianId) throw new Error('Not authenticated');

      const freshTemplates = await getTemplates(technicianId);

      const promises = newSchedule.map(({ day_of_week, active }) => {
        const existing = freshTemplates.find((e) => e.day_of_week === day_of_week);
        if (existing) {
          if (existing.active !== active) {
            return updateTemplate(technicianId, existing.id, { active });
          }
          return Promise.resolve(existing);
        }
        return createTemplate(technicianId, { day_of_week, active });
      });

      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technician-templates', user?.id] });
    },
  });
}

// ─── Exceptions (single-day unavailability overrides) ────────────────────────

export function useExceptionsQuery() {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ['technician-exceptions', user?.id],
    queryFn: () => getExceptions(user!.id),
    enabled: !!user?.id,
  });
}

export function useAddExceptionMutation() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async (date: string) => {
      const technicianId = user?.id;
      if (!technicianId) throw new Error('Not authenticated');
      return createException(technicianId, { date });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technician-exceptions', user?.id] });
    },
  });
}

export function useDeleteExceptionMutation() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async (exceptionId: string) => {
      const technicianId = user?.id;
      if (!technicianId) throw new Error('Not authenticated');
      return deleteException(technicianId, exceptionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technician-exceptions', user?.id] });
    },
  });
}

// ─── Technician orders (for calendar display) ─────────────────────────────────

export function useTechnicianOrdersQuery() {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ['technician-orders-calendar', user?.id],
    queryFn: () => getTechnicianOrders(user!.id),
    enabled: !!user?.id,
    refetchInterval: 60_000,
  });
}

/** Groups orders by scheduled_date → Record<'YYYY-MM-DD', TechnicianOrder[]> */
export function useOrdersByDate(): Record<string, TechnicianOrder[]> {
  const { data: orders = [] } = useTechnicianOrdersQuery();
  return useMemo(() => {
    const map: Record<string, TechnicianOrder[]> = {};
    for (const order of orders) {
      // Only include accepted bookings on the calendar visually
      if (order.status !== 'accepted') continue;

      if (!map[order.scheduled_date]) map[order.scheduled_date] = [];
      map[order.scheduled_date].push(order);
    }
    return map;
  }, [orders]);
}