// Phase 4c Plan 06 — Realtime invalidation hook.
//
// Subscribes to Supabase Realtime postgres_changes for a single order row.
// On UPDATE, invalidates the Tanstack Query keys that drive the order/booking
// UI. A 3s polling fallback runs in parallel so a misconfigured RLS or an
// auth bridge gap does not silently break the dual-confirm flow (Risk 1).
//
// Cleanup: supabase.removeChannel is called in the useEffect cleanup so the
// channel does not leak between screen navigations.

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/src/lib/supabase";
import { orderQueryKeys } from "../schemas/query-keys";

/**
 * Subscribes to Supabase Realtime UPDATE events on the `orders` table
 * filtered to `orderId`. On any update the hook invalidates the three
 * query keys that drive order/booking screens.
 *
 * A 3s polling fallback runs in parallel as a belt-and-braces mitigation
 * for Risk 1 (Realtime RLS auth bridge).
 *
 * @param orderId - The order UUID to watch. Subscription skipped when falsy.
 * @param enabled - Pass `false` to suppress both Realtime and polling (e.g.
 *   when the order reaches a terminal state and the host unmounts).
 */
export function useOrderRealtimeInvalidate(
	orderId: string,
	enabled: boolean,
): void {
	const queryClient = useQueryClient();

	// ── Realtime subscription ────────────────────────────────────────────────
	useEffect(() => {
		if (!enabled || !orderId) return;

		const channel = supabase
			.channel(`order:${orderId}`)
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "orders",
					filter: `id=eq.${orderId}`,
				},
				() => {
					void queryClient.invalidateQueries({
						queryKey: orderQueryKeys.userOrders,
					});
					void queryClient.invalidateQueries({
						queryKey: orderQueryKeys.technicianBookings,
					});
					void queryClient.invalidateQueries({
						predicate: (q) =>
							q.queryKey[0] === "order-quotes" &&
							q.queryKey[2] === orderId,
					});
				},
			)
			.subscribe();

		return () => {
			void supabase.removeChannel(channel);
		};
	}, [orderId, enabled, queryClient]);

	// ── 3s polling fallback (Risk 1 mitigation) ──────────────────────────────
	useEffect(() => {
		if (!enabled || !orderId) return;

		const id = setInterval(() => {
			void queryClient.invalidateQueries({
				queryKey: orderQueryKeys.technicianBookings,
			});
			void queryClient.invalidateQueries({
				queryKey: orderQueryKeys.userOrders,
			});
		}, 3_000);

		return () => clearInterval(id);
	}, [orderId, enabled, queryClient]);
}
