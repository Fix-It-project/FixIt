import { useMemo } from "react";
import { useUserOrdersQuery } from "@/src/features/booking-orders/hooks/useUserOrders";
import type { Order } from "@/src/features/booking-orders/schemas/response.schema";
import { useReviewPromptStore } from "@/src/features/reviews/stores/review-prompt-store";

export interface PendingReviewOrder {
  orderId: string;
  technicianId: string;
  technicianName: string;
}

export function useReviewPromptTrigger(): { pendingOrder: PendingReviewOrder | null } {
  const { data: orders = [] } = useUserOrdersQuery();
  const skippedOrderIds = useReviewPromptStore((s) => s.skippedOrderIds);
  const submittedOrderIds = useReviewPromptStore((s) => s.submittedOrderIds);

  const pendingOrder = useMemo<PendingReviewOrder | null>(() => {
    const candidate = orders.find(
      (o: Order) =>
        o.status === "completed" &&
        !o.has_review &&
        !skippedOrderIds.has(o.id) &&
        !submittedOrderIds.has(o.id),
    );
    if (!candidate) return null;
    return {
      orderId: candidate.id,
      technicianId: candidate.technician_id,
      technicianName: candidate.technician_name ?? "Technician",
    };
  }, [orders, skippedOrderIds, submittedOrderIds]);

  return { pendingOrder };
}
