// Actor-scoped realtime subscription. Mounted once at the technician / user
// layout root so every list screen (dashboard, schedule, bookings, orders)
// auto-refreshes when an order is created, accepted, cancelled, etc. — without
// any background polling.
//
// This replaces the previous `refetchInterval` polling on the list queries.
// Per-order detail screens still mount `useOrderRealtimeInvalidate` for the
// order_quotes channel + finer-grained event tracking.

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { logger } from "@/src/lib/logger";
import { supabase } from "@/src/config/supabase";

type Actor = "user" | "technician";

export function useActorOrdersRealtime(
	actor: Actor,
	actorId: string | undefined,
): void {
	const queryClient = useQueryClient();

	useEffect(() => {
		if (!actorId) return;

		const filter =
			actor === "technician"
				? `technician_id=eq.${actorId}`
				: `user_id=eq.${actorId}`;

		const invalidate = () => {
			if (actor === "technician") {
				queryClient.invalidateQueries({
					queryKey: ["technician-bookings"],
				});
				queryClient.invalidateQueries({ queryKey: ["dashboard-orders"] });
				queryClient.invalidateQueries({ queryKey: ["schedule-events"] });
			} else {
				queryClient.invalidateQueries({ queryKey: ["user-orders"] });
			}
		};

		const channel = supabase
			.channel(`${actor}-orders:${actorId}`)
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "orders",
					filter,
				},
				(payload) => {
					logger.debug("ActorOrdersRealtime", "orders event", {
						actor,
						eventType: payload.eventType,
					});
					invalidate();
				},
			)
			.subscribe((status, err) => {
				if (status === "SUBSCRIBED") {
					logger.info("ActorOrdersRealtime", "channel SUBSCRIBED", { actor });
				} else if (status === "CHANNEL_ERROR") {
					logger.error("ActorOrdersRealtime", "channel CHANNEL_ERROR", {
						actor,
						error: err?.message ?? String(err),
					});
				} else if (status === "TIMED_OUT") {
					logger.warn("ActorOrdersRealtime", "channel TIMED_OUT", { actor });
				}
			});

		return () => {
			supabase.removeChannel(channel);
		};
	}, [actor, actorId, queryClient]);
}
