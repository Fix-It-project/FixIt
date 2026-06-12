import { useTranslation } from "react-i18next";
import PastOrdersList, {
	type PastOrdersListItem,
} from "@/src/features/booking-orders/components/shared/PastOrdersList";
import { useUserPastOrders } from "@/src/features/booking-orders/hooks/useUserOrders";
import { ROUTES, useSafeBack } from "@/src/lib/navigation";

export default function PastOrdersScreen() {
	const { t } = useTranslation("orders");
	const { data: orders } = useUserPastOrders();
	const goBack = useSafeBack(ROUTES.user.profile);
	const items: PastOrdersListItem[] = orders.map((order) => ({
		id: order.id,
		name: order.technician_name,
		fallbackName: t("card.technicianFallback"),
		avatarName: order.technician_name,
		avatarImage: order.technician_image,
		categoryId: order.category_id,
		serviceId: order.service_id,
		serviceName: order.service_name,
		scheduledDate: order.scheduled_date,
		scheduledStartAt: order.scheduled_start_at,
		status: order.status,
		route: ROUTES.user.orderDetail(order.id),
	}));

	return (
		<PastOrdersList items={items} onBack={goBack} statusPerspective="user" />
	);
}
