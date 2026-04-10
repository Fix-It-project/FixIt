import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getExceptions,
  createException,
  deleteException,
  getTechnicianOrders,
} from '@/src/features/schedule/api/calendar';
import type { TechnicianOrder } from '@/src/features/schedule/schemas/response.schema';
import { useAuthStore } from '@/src/stores/auth-store';

// ─── Templates (recurring weekly schedule) ────────────────────────────────────
// Canonical definitions live in useTemplates.ts — re-exported here so that
// existing import sites (e.g. ScheduleScreen) keep working without changes.
export { useTemplatesQuery, useSaveTemplatesMutation } from './useTemplates';

// ─── Exceptions (single-day unavailability overrides) ────────────────────────

export function useExceptionsQuery() {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ['technician-exceptions', user?.id],
    queryFn: () => {
      if (!user?.id) throw new Error('User not authenticated');
      return getExceptions(user.id);
    },
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
    queryFn: () => {
      if (!user?.id) throw new Error('User not authenticated');
      return getTechnicianOrders(user.id);
    },
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
