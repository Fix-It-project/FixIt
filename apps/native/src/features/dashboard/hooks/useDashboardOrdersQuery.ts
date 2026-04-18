import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/src/stores/auth-store";
import { getDashboardOrders } from "../api/dashboard-orders";
import type { DashboardOrder } from "../schemas/response.schema";

function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export function useDashboardOrdersQuery() {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: ["dashboard-orders", user?.id],
    queryFn: () => {
      if (!user?.id) throw new Error("User not authenticated");
      return getDashboardOrders(user.id);
    },
    enabled: !!user?.id,
    refetchInterval: 60_000,
  });
}

export function usePendingDashboardOrders() {
  const query = useDashboardOrdersQuery();
  const data = useMemo(
    () => (query.data ?? []).filter((order) => order.status === "pending"),
    [query.data],
  );
  return { ...query, data };
}

export function useTodayAcceptedDashboardOrders(): DashboardOrder[] {
  const { data: orders = [] } = useDashboardOrdersQuery();

  return useMemo(() => {
    const today = localToday();
    return orders.filter(
      (order) => order.status === "accepted" && order.scheduled_date === today,
    );
  }, [orders]);
}
