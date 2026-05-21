import { create } from "zustand";

import type { OrderStatus } from "@/src/features/booking-orders/schemas/order-status.schema";

/**
 * Optimistic transition record written by mutation hooks in `onMutate` and
 * cleared in `onSettled`. Selectors may treat a transition older than ~5s as
 * stale (server didn't respond, mutation likely failed).
 */
export interface OptimisticTransition {
	orderId: string;
	to: OrderStatus;
	startedAt: number;
}

/**
 * In-session UI cache for the active-order state machine.
 *
 * Per Phase 4a decision D4, this store deliberately does NOT persist. The
 * backend `orders.status` row is canonical; React Query + Supabase Realtime
 * rehydrate the screen on app restart. Persisting here would risk a stale
 * snapshot driving UI after the server has already moved on.
 */
export interface ActiveOrderState {
	currentOrderId: string | null;
	lastSeenStatus: OrderStatus | null;
	optimisticTransition: OptimisticTransition | null;
	animationLocks: ReadonlySet<string>;

	setCurrent: (orderId: string | null) => void;
	setLastSeenStatus: (status: OrderStatus | null) => void;
	setOptimisticTransition: (transition: OptimisticTransition | null) => void;
	clearOptimisticTransition: () => void;
	acquireAnimationLock: (key: string) => void;
	releaseAnimationLock: (key: string) => void;
	hasAnimationLock: (key: string) => boolean;
	reset: () => void;
}

export const useActiveOrderStore = create<ActiveOrderState>((set, get) => ({
	currentOrderId: null,
	lastSeenStatus: null,
	optimisticTransition: null,
	animationLocks: new Set<string>(),

	setCurrent: (orderId) => set({ currentOrderId: orderId }),
	setLastSeenStatus: (status) => set({ lastSeenStatus: status }),
	setOptimisticTransition: (transition) =>
		set({ optimisticTransition: transition }),
	clearOptimisticTransition: () => set({ optimisticTransition: null }),

	acquireAnimationLock: (key) =>
		set((state) => {
			const next = new Set(state.animationLocks);
			next.add(key);
			return { animationLocks: next };
		}),
	releaseAnimationLock: (key) =>
		set((state) => {
			if (!state.animationLocks.has(key)) {
				return {};
			}
			const next = new Set(state.animationLocks);
			next.delete(key);
			return { animationLocks: next };
		}),
	hasAnimationLock: (key) => get().animationLocks.has(key),

	reset: () =>
		set({
			currentOrderId: null,
			lastSeenStatus: null,
			optimisticTransition: null,
			animationLocks: new Set<string>(),
		}),
}));
