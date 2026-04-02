import { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTechnicianOrdersQuery } from './useCalendar';
import { updateTechnicianOrderStatus } from '@/src/services/tech-calendar/api/calendar';
import type { TechnicianOrder } from '@/src/services/tech-calendar/schemas/response.schema';

function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** All orders with status 'pending' */
export function usePendingOrders() {
  const query = useTechnicianOrdersQuery();
  const pending = useMemo(
    () => (query.data ?? []).filter((o) => o.status === 'pending'),
    [query.data],
  );
  return { ...query, data: pending };
}

/** Accepted orders scheduled for today */
export function useTodaysAcceptedOrders(): TechnicianOrder[] {
  const { data: orders = [] } = useTechnicianOrdersQuery();
  return useMemo(() => {
    const today = localToday();
    return orders.filter((o) => o.status === 'accepted' && o.scheduled_date === today);
  }, [orders]);
}

export function useAcceptOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => updateTechnicianOrderStatus(orderId, 'accepted'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technician-orders-calendar'] });
    },
  });
}

export function useRejectOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => updateTechnicianOrderStatus(orderId, 'rejected'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technician-orders-calendar'] });
    },
  });
}

export function useCancelOrderByTechnicianMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason?: string }) =>
      updateTechnicianOrderStatus(orderId, 'cancelled_by_technician', reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technician-orders-calendar'] });
    },
  });
}

export function useCompleteOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => updateTechnicianOrderStatus(orderId, 'completed'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technician-orders-calendar'] });
    },
  });
}

/** Find a single booking by ID from the cached orders list */
export function useBookingById(orderId: string): TechnicianOrder | undefined {
  const { data: orders = [] } = useTechnicianOrdersQuery();
  return useMemo(
    () => orders.find((o) => o.id === orderId),
    [orders, orderId],
  );
}
