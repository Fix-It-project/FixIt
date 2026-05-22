// Phase 4a Plan 06 — User active-order driver hook.
//
// Returns the SINGLE active order for the authenticated user, derived
// client-side from the existing `useUserOrdersQuery` list. NO new endpoint.
// Active/bubble/phase derivation + zustand sync live in `_active-order-shared`.

import { useMemo } from "react";
import type { UiPhase } from "../schemas/order-status.schema";
import type { Order } from "../schemas/response.schema";
import {
	deriveActiveOrderState,
	useSyncActiveOrderStore,
} from "./_active-order-shared";
import { useUserOrdersQuery } from "./useUserOrders";

export interface UseUserActiveOrderResult {
	activeOrder: Order | undefined;
	/**
	 * The order the floating ActiveOrderBubble should pin to: in a tracking-or-later
	 * lifecycle stage (excludes `accepted`/`pending`), and stickied to the EARLIEST
	 * such order so a newer order placed later cannot steal focus.
	 */
	bubbleOrder: Order | undefined;
	isLoading: boolean;
	currentPhase: UiPhase | null;
}

export function useUserActiveOrder(): UseUserActiveOrderResult {
	const { data: orders = [], isLoading } = useUserOrdersQuery();

	const { activeOrder, bubbleOrder, currentPhase } = useMemo(
		() => deriveActiveOrderState(orders, "user"),
		[orders],
	);

	useSyncActiveOrderStore(activeOrder);

	return { activeOrder, bubbleOrder, isLoading, currentPhase };
}
