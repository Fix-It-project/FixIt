import PastOrdersList, { type PastOrdersListItem } from "@/src/features/booking-orders/components/shared/PastOrdersList";
import { useTechPastOrders } from "@/src/hooks/tech/useTechBookingsQuery";
import { useSafeBack } from "@/src/lib/navigation";

function statusLabel(status: string): string {
  if (status === "completed") return "Completed";
  if (status === "cancelled_by_user") return "Cancelled by client";
  return "Cancelled";
}

export default function PastOrdersScreen() {
  const { data: orders } = useTechPastOrders();
  const goBack = useSafeBack("/(tech-app)/(profile)");
  const items: PastOrdersListItem[] = orders.map((order) => ({
    id: order.id,
    name: order.user_name,
    fallbackName: "Unknown Client",
    avatarName: order.user_name,
    categoryId: order.category_id,
    serviceName: order.service_name,
    scheduledDate: order.scheduled_date,
    status: order.status,
    statusLabel: statusLabel(order.status),
    route: `/(tech-app)/(bookings)/${order.id}`,
  }));

  return <PastOrdersList items={items} onBack={goBack} />;
}
