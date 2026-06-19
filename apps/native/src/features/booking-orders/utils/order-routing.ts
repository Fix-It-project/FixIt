// Single source of truth for "where does tapping an order card go?".
//
// Terminal orders (completed / cancelled / declined / rejected) open the
// read-only summary; everything else opens the live state-machine detail. Using
// this everywhere stops any card surface from leaking a finished order back into
// the live flow.

import { router } from "expo-router";
import { ROUTES } from "@/src/lib/navigation";
import {
	type OrderStatus,
	TERMINAL_STATUSES,
} from "../schemas/order-status.schema";

export function isTerminalOrder(status: string): boolean {
	return TERMINAL_STATUSES.has(status as OrderStatus);
}

export function routeToOrder(
	order: { id: string; status: string },
	viewer: "user" | "technician",
): void {
	const terminal = isTerminalOrder(order.status);
	if (viewer === "user") {
		router.push(
			terminal
				? ROUTES.user.orderSummary(order.id)
				: ROUTES.user.orderDetail(order.id),
		);
		return;
	}
	router.push(
		terminal
			? ROUTES.technician.bookingSummary(order.id)
			: ROUTES.technician.bookingDetail(order.id),
	);
}
