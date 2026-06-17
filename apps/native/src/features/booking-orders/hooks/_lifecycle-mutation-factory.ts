// Shared factory + invalidation helpers for lifecycle mutations.
//
// Every lifecycle mutation wraps a Plan 04a-05 transport in a Tanstack
// `useMutation` with:
//   • `onMutate`  → optimistic-transition record in the active-order zustand store
//   • `onSuccess` → query-key invalidation
//   • `onSettled` → unconditional optimistic-flag clear (idempotent)

import {
	type QueryClient,
	type UseMutationResult,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { useActiveOrderStore } from "@/src/stores/active-order-store";
import { orderQueryKeys } from "../schemas/query-keys";
import type { OrderStatus } from "../schemas/order-status.schema";

export interface LifecycleMutationOpts<TArgs, TResult> {
	/** Status hint written to `optimisticTransition`; `null` skips the optimistic write. */
	optimisticTo: OrderStatus | null;
	/** Pull the orderId from the mutation args (most accept `{ orderId, ... }`). */
	extractOrderId: (args: TArgs) => string;
	/** Invalidate all query keys impacted by this transition. */
	invalidate: (queryClient: QueryClient, args: TArgs, result: TResult) => void;
	/**
	 * Identifies the mutation in error logs + dedupe (query-client `handleCacheError`
	 * reads `key[0]`). Without it, every lifecycle error logs as "[mutation] unknown".
	 * Defaults to ["lifecycle"].
	 */
	mutationKey?: readonly unknown[];
}

export function useLifecycleMutation<TArgs, TResult>(
	mutationFn: (args: TArgs) => Promise<TResult>,
	opts: LifecycleMutationOpts<TArgs, TResult>,
): UseMutationResult<TResult, Error, TArgs> {
	const queryClient = useQueryClient();
	const setOptimistic = useActiveOrderStore((s) => s.setOptimisticTransition);
	const clearOptimistic = useActiveOrderStore(
		(s) => s.clearOptimisticTransition,
	);

	return useMutation<TResult, Error, TArgs>({
		mutationKey: opts.mutationKey ?? ["lifecycle"],
		mutationFn,
		onMutate: (args) => {
			if (opts.optimisticTo != null) {
				setOptimistic({
					orderId: opts.extractOrderId(args),
					to: opts.optimisticTo,
					startedAt: Date.now(),
				});
			}
		},
		onSuccess: (result, args) => {
			opts.invalidate(queryClient, args, result);
		},
		onSettled: () => {
			clearOptimistic();
		},
	});
}

// ─── Invalidation helpers ──────────────────────────────────────────────────

export const invalidateUserOrders = (qc: QueryClient) =>
	qc.invalidateQueries({ queryKey: orderQueryKeys.userOrders });

export const invalidateTechBookings = (qc: QueryClient) =>
	qc.invalidateQueries({ queryKey: orderQueryKeys.technicianBookings });

// Keys are viewer-scoped ["order-distance" | "order-quotes", viewer, orderId].
// Use a predicate so we invalidate both viewer entries for the same orderId.
export const invalidateDistance = (qc: QueryClient, orderId: string) =>
	qc.invalidateQueries({
		predicate: (q) =>
			q.queryKey[0] === "order-distance" && q.queryKey[2] === orderId,
	});

export const invalidateQuotes = (qc: QueryClient, orderId: string) =>
	qc.invalidateQueries({
		predicate: (q) =>
			q.queryKey[0] === "order-quotes" && q.queryKey[2] === orderId,
	});

export const invalidateOrderReschedule = (qc: QueryClient, orderId: string) =>
	qc.invalidateQueries({ queryKey: orderQueryKeys.orderReschedule(orderId) });
