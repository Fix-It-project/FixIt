// User-side wrapper around ActiveOrderBubblePresenter.
// Owns the user-only data hooks so the technician bookings query never fires
// on the user home.

import { router } from "expo-router";
import { useOrderDistance, useUserActiveOrder } from "@/src/features/booking-orders/hooks";
import { ROUTES } from "@/src/lib/navigation";
import ActiveOrderBubblePresenter from "./ActiveOrderBubblePresenter";

export default function UserActiveOrderBubble() {
	const { bubbleOrder } = useUserActiveOrder();
	const orderId = bubbleOrder?.id ?? "";
	const isTracking = bubbleOrder?.status === "tracking";

	const { data: distance } = useOrderDistance(orderId, {
		enabled: isTracking,
		viewer: "user",
	});

	return (
		<ActiveOrderBubblePresenter
			active={bubbleOrder ?? null}
			etaMinutes={distance?.eta_minutes ?? null}
			viewer="user"
			onPress={() => {
				if (bubbleOrder) router.push(ROUTES.user.orderDetail(bubbleOrder.id));
			}}
		/>
	);
}
