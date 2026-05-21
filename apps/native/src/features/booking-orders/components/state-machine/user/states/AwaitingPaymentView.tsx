// Phase 4d Plan 02 — User awaiting-payment view.
//
// Replaced the cash-payment-specific shell with the shared OrderSummaryFinalize
// (read-only summary + dual-confirm finalize). Payments aren't implemented yet,
// so the "Mark order completed" button funnels through the existing
// useUserCheckout flow which the lifecycle smoke auto-finalize converts to
// `completed`.

import type { Order } from "@/src/features/booking-orders/schemas/response.schema";
import OrderSummaryFinalize from "../../shared/OrderSummaryFinalize";

interface Props {
	readonly order: Order;
}

export default function AwaitingPaymentView({ order }: Props) {
	return <OrderSummaryFinalize order={order} viewer="user" />;
}
