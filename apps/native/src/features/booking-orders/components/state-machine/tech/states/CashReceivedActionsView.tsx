// Phase 4d Plan 02 — Tech awaiting-payment view.
//
// Rendered for `awaiting_payment` status. Replaces the cash-receipt modal
// shell with the shared OrderSummaryFinalize component (summary + dual-confirm
// finalize). When the customer presses their finalize button server-side, the
// tech side sees an "other party confirmed" banner and a one-tap completion.

import type { Order } from "@/src/features/booking-orders/schemas/response.schema";
import OrderSummaryFinalize from "@/src/features/booking-orders/components/state-machine/shared/OrderSummaryFinalize";

interface Props {
	readonly order: Order;
}

export default function CashReceivedBody({ order }: Props) {
	return <OrderSummaryFinalize order={order} viewer="technician" />;
}

export function CashReceivedCta(_props: Props): null {
	// Body owns the finalize button — no sticky CTA.
	return null;
}
