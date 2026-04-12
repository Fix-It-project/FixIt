import PastOrdersList, { type PastOrdersListItem } from "@/src/features/booking-orders/components/shared/PastOrdersList";
import { useUserPastOrders } from "@/src/hooks/orders/useUserOrders";

function statusLabel(status: string): string {
  if (status === "completed") return "Completed";
  if (status === "cancelled_by_technician") return "Cancelled by tech";
  return "Cancelled";
}

export default function PastOrdersScreen() {
  const { data: orders } = useUserPastOrders();
  const items: PastOrdersListItem[] = orders.map((order) => ({
    id: order.id,
    name: order.technician_name,
    fallbackName: "Technician",
    avatarName: order.technician_name,
    avatarImage: order.technician_image,
    categoryId: order.category_id,
    serviceName: order.service_name,
    scheduledDate: order.scheduled_date,
    status: order.status,
    statusLabel: statusLabel(order.status),
    route: { pathname: "/(app)/(orders)/[id]", params: { id: order.id } },
  }));

  return <PastOrdersList items={items} />;
}
