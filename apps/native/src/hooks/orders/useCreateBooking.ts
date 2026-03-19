import { useMutation } from '@tanstack/react-query';
import { createOrder } from '@/src/services/orders/api/orders';

export function useCreateBookingMutation() {
  return useMutation({
    mutationFn: createOrder,
  });
}