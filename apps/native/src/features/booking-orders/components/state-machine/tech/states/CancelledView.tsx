// Phase 4c Plan 03 — Tech CancelledView.
//
// Terminal cancelled-path body. Mirrors user/states/CancelledView.tsx shape:
// status banner (with optional cancellation reason) + client/info cards for
// historical reference.

import { View } from "react-native";
import {
	BookingClientCard,
	BookingInfoSection,
} from "@/src/features/booking-orders/components/tech";
import OrderStatusBanner from "@/src/features/booking-orders/components/user/OrderStatusBanner";
import type {
	Order,
	TechnicianBooking,
} from "@/src/features/booking-orders/schemas/response.schema";
import { spacing } from "@/src/constants/design-tokens";

interface Props {
	readonly order: Order;
}

export default function CancelledView({ order }: Props) {
	const booking = order as unknown as TechnicianBooking;

	return (
		<View style={{ padding: spacing.card.padding, gap: spacing.stack.lg }}>
			<OrderStatusBanner
				status={order.status}
				cancellationReason={order.cancellation_reason}
			/>
			<BookingClientCard booking={booking} />
			<BookingInfoSection booking={booking} />
		</View>
	);
}
