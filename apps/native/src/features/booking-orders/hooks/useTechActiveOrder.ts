// Phase 4a Plan 06 — Technician active-order driver hook.
//
// Mirrors `useUserActiveOrder` but consumes `useTechnicianBookingsQuery`.
// Shared derivation + zustand sync live in `_active-order-shared`.

import { useMemo } from "react";
import type { UiPhase } from "../schemas/order-status.schema";
import type { TechnicianBooking } from "../schemas/response.schema";
import {
	deriveActiveOrderState,
	useSyncActiveOrderStore,
} from "./_active-order-shared";
import { useTechnicianBookingsQuery } from "./useTechnicianBookingsQuery";

export interface UseTechActiveOrderResult {
	activeOrder: TechnicianBooking | undefined;
	/**
	 * The booking the floating ActiveOrderBubble should pin to: in a tracking-or-later
	 * lifecycle stage (excludes `accepted`), and stickied to the EARLIEST such booking.
	 */
	bubbleOrder: TechnicianBooking | undefined;
	isLoading: boolean;
	currentPhase: UiPhase | null;
}

export function useTechActiveOrder(): UseTechActiveOrderResult {
	const { data: bookings = [], isLoading } = useTechnicianBookingsQuery();

	const { activeOrder, bubbleOrder, currentPhase } = useMemo(
		() => deriveActiveOrderState(bookings, "technician"),
		[bookings],
	);

	useSyncActiveOrderStore(activeOrder);

	return { activeOrder, bubbleOrder, isLoading, currentPhase };
}
