import PastOrdersList, {
	type PastOrdersListItem,
} from "@/src/features/booking-orders/components/shared/PastOrdersList";
import { usePastTechnicianBookings } from "@/src/features/booking-orders/hooks/useTechnicianBookingsQuery";
import { useSafeBack } from "@/src/lib/navigation";
import { ROUTES } from "@/src/lib/routes";

function statusLabel(status: string): string {
	if (status === "completed") return "Completed";
	if (status === "cancelled_by_user") return "Cancelled by client";
	return "Cancelled";
}

export default function PastOrdersScreen() {
	const { data: orders } = usePastTechnicianBookings();
	const goBack = useSafeBack(ROUTES.technician.profile);
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
		route: ROUTES.technician.bookingDetail(order.id),
	}));

	return <PastOrdersList items={items} onBack={goBack} />;
}
