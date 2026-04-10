import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserOrders, cancelUserOrder } from "@/src/features/booking-orders/api/orders";
import type { Order } from "@/src/features/booking-orders/schemas/response.schema";

const USER_ORDERS_KEY = ["user-orders"] as const;

export function useUserOrdersQuery() {
  return useQuery({
    queryKey: USER_ORDERS_KEY,
    queryFn: async () => {
      const res = await getUserOrders();
      return res.data;
    },
  });
}

export function useUserOrderById(orderId: string): Order | undefined {
  const { data: orders = [] } = useUserOrdersQuery();
  return useMemo(() => orders.find((o) => o.id === orderId), [orders, orderId]);
}

export function useUserPastOrders() {
  const query = useUserOrdersQuery();
  const pastStatuses = new Set(["completed", "cancelled_by_user", "cancelled_by_technician"]);
  const orders = useMemo(
    () => (query.data ?? []).filter((o) => pastStatuses.has(o.status)),
    [query.data],
  );
  return { ...query, data: orders };
}

export function useCancelOrderByUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason?: string }) =>
      cancelUserOrder(orderId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_ORDERS_KEY });
    },
  });
}
