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
import { logger } from "@/src/lib/logger";
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

		const invalidateAll = () => {
			void queryClient.invalidateQueries({
				queryKey: orderQueryKeys.userOrders,
			});
			void queryClient.invalidateQueries({
				queryKey: orderQueryKeys.technicianBookings,
			});
			void queryClient.invalidateQueries({
				predicate: (q) =>
					q.queryKey[0] === "order-quotes" && q.queryKey[2] === orderId,
			});
		};

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
				(payload) => {
					logger.debug("OrderRealtime", "orders UPDATE received", {
						orderId,
						eventType: payload.eventType,
					});
					invalidateAll();
				},
			)
			// rpc_submit_quote only UPDATEs `orders` on the first transition into
			// `negotiating`; later counter-quote rounds only touch `order_quotes`.
			// Without this listener, multi-round negotiations would not sync.
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "order_quotes",
					filter: `order_id=eq.${orderId}`,
				},
				(payload) => {
					logger.debug("OrderRealtime", "order_quotes change received", {
						orderId,
						eventType: payload.eventType,
					});
					invalidateAll();
				},
			)
			.subscribe((status, err) => {
				if (status === "SUBSCRIBED") {
					logger.info("OrderRealtime", "channel SUBSCRIBED", { orderId });
				} else if (status === "CHANNEL_ERROR") {
					logger.error("OrderRealtime", "channel CHANNEL_ERROR", {
						orderId,
						error: err?.message ?? String(err),
					});
				} else if (status === "TIMED_OUT") {
					logger.warn("OrderRealtime", "channel TIMED_OUT", { orderId });
				} else if (status === "CLOSED") {
					logger.debug("OrderRealtime", "channel CLOSED", { orderId });
				}
			});

		return () => {
			void supabase.removeChannel(channel);
		};
	}, [orderId, enabled, queryClient]);

	// ── 30s polling safety net (Risk 1 mitigation) ───────────────────────────
	// Realtime subscriptions can silently fail (RLS misconfig, dropped socket).
	// This long-interval poll catches that gap without flooding the server.
	useEffect(() => {
		if (!enabled || !orderId) return;

		const id = setInterval(() => {
			void queryClient.invalidateQueries({
				queryKey: orderQueryKeys.technicianBookings,
			});
			void queryClient.invalidateQueries({
				queryKey: orderQueryKeys.userOrders,
			});
		}, 30_000);

		return () => clearInterval(id);
	}, [orderId, enabled, queryClient]);
}
