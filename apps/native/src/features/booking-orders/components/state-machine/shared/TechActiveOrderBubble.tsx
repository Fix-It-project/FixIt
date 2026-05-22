// Technician-side wrapper around ActiveOrderBubblePresenter.

import { router } from "expo-router";
import { useOrderDistance, useTechActiveOrder } from "@/src/features/booking-orders/hooks";
import { ROUTES } from "@/src/lib/routes";
import ActiveOrderBubblePresenter from "./ActiveOrderBubblePresenter";

export default function TechActiveOrderBubble() {
	const { bubbleOrder } = useTechActiveOrder();
	const orderId = bubbleOrder?.id ?? "";
	const isTracking = bubbleOrder?.status === "tracking";

	const { data: distance } = useOrderDistance(orderId, {
		enabled: isTracking,
		viewer: "technician",
	});

	return (
		<ActiveOrderBubblePresenter
			active={(bubbleOrder ?? null) as never}
			etaMinutes={distance?.eta_minutes ?? null}
			viewer="technician"
			onPress={() => {
				if (bubbleOrder)
					router.push(ROUTES.technician.bookingDetail(bubbleOrder.id));
			}}
		/>
	);
}
