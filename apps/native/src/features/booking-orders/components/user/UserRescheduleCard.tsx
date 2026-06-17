import { router } from "expo-router";
import { View } from "react-native";
import RescheduleRequestPanel from "@/src/features/booking-orders/components/state-machine/shared/RescheduleRequestPanel";
import UserOrderCard from "@/src/features/booking-orders/components/user/UserOrderCard";
import type { Order } from "@/src/features/booking-orders/schemas/response.schema";
import { useDebounce } from "@/src/hooks/useDebounce";
import { ROUTES } from "@/src/lib/navigation";

/**
 * One row in the Activity → Reschedule Requests tab: the order summary (taps
 * through to the order detail) stacked above the actionable reschedule panel
 * (approve / reject / withdraw), which fetches its own request via
 * `useOrderRescheduleQuery`.
 */
export default function UserRescheduleCard({
	order,
}: {
	readonly order: Order;
}) {
	const goToOrder = useDebounce(() =>
		router.push(ROUTES.user.orderDetail(order.id)),
	);

	return (
		<View className="gap-stack-sm">
			<UserOrderCard order={order} onPress={goToOrder} />
			<RescheduleRequestPanel orderId={order.id} viewer="user" forceVisible />
		</View>
	);
}
