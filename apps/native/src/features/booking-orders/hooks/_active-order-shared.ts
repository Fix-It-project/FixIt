// Shared derivation for the user/technician active-order hooks.
//
// `useUserActiveOrder` and `useTechActiveOrder` differ only in their source
// query; the active/bubble/phase derivation and the zustand sync are identical.

import { useEffect } from "react";
import { useActiveOrderStore } from "@/src/stores/active-order-store";
import {
	ACTIVE_STATUSES,
	IN_PROGRESS_STATUSES,
	type OrderStatus,
	type UiPhase,
} from "../schemas/order-status.schema";
import type { Order } from "../schemas/response.schema";
import { deriveUiState } from "../utils/derive-ui-state";

interface ActiveOrderLike {
	id: string;
	active?: boolean;
	status: OrderStatus;
	created_at?: string | null;
}

export interface ActiveOrderState<T> {
	activeOrder: T | undefined;
	bubbleOrder: T | undefined;
	currentPhase: UiPhase | null;
}

const timestamp = (value?: string | null): number =>
	value ? new Date(value).getTime() : 0;

/**
 * Derives the single active order, the bubble-pinned order (earliest
 * in-progress), and the current UI phase from a list of order-like records.
 */
export function deriveActiveOrderState<T extends ActiveOrderLike>(
	records: readonly T[],
	viewer: "user" | "technician",
): ActiveOrderState<T> {
	const activeOrder = records.find((r) =>
		typeof r.active === "boolean" ? r.active : ACTIVE_STATUSES.has(r.status),
	);

	const matches = records.filter((r) => IN_PROGRESS_STATUSES.has(r.status));
	const bubbleOrder =
		matches.length === 0
			? undefined
			: matches.reduce((earliest, candidate) =>
					timestamp(candidate.created_at) < timestamp(earliest.created_at)
						? candidate
						: earliest,
				);

	const currentPhase = activeOrder
		? deriveUiState(activeOrder as unknown as Order, viewer).phase
		: null;

	return { activeOrder, bubbleOrder, currentPhase };
}

/**
 * Syncs the derived active order into the non-React zustand store so the
 * floating bubble can re-render without prop drilling. The single legitimate
 * useEffect: bridging Tanstack-derived state to an external store.
 */
export function useSyncActiveOrderStore(
	activeOrder: ActiveOrderLike | undefined,
): void {
	useEffect(() => {
		const { setCurrent, setLastSeenStatus } = useActiveOrderStore.getState();
		setCurrent(activeOrder?.id ?? null);
		setLastSeenStatus(activeOrder?.status ?? null);
	}, [activeOrder?.id, activeOrder?.status]);
}
