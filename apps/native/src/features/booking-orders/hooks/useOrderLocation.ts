// Live technician position for one order, sourced from `order_locations`
// (one latest point per order). The technician's background task upserts this
// row while the order is in `tracking`; RLS already scopes reads to the order's
// user/technician, so the customer can read it with no dedicated endpoint.
//
// Realtime only pushes *changes*, so we do an initial fetch first — otherwise
// the map would stay empty until the technician's next ping (up to 30s).

import { useEffect, useState } from "react";
import { supabase } from "@/src/config/supabase";
import { logger } from "@/src/lib/logger";

export interface OrderLiveLocation {
	readonly latitude: number;
	readonly longitude: number;
	readonly heading: number | null;
	readonly updatedAt: string | null;
}

interface OrderLocationRow {
	latitude: number | null;
	longitude: number | null;
	heading: number | null;
	updated_at: string | null;
}

/**
 * Subscribes to the technician's live coordinate for `orderId`.
 *
 * @param orderId Order to watch. Fetch + subscription skipped when falsy.
 * @param enabled Pass `false` to disable (e.g. once the order leaves
 *   `tracking`); the hook then returns `null`.
 * @returns The latest `{ latitude, longitude, heading, updatedAt }` or `null`
 *   while unknown.
 */
export function useOrderLocation(
	orderId: string,
	enabled: boolean,
): OrderLiveLocation | null {
	const [location, setLocation] = useState<OrderLiveLocation | null>(null);

	useEffect(() => {
		// Clear on every (orderId, enabled) change so a previous order's marker
		// never lingers before the new initial fetch lands.
		setLocation(null);

		if (!enabled || !orderId) {
			return;
		}

		let active = true;

		const apply = (row: OrderLocationRow | null) => {
			if (!active || !row || row.latitude == null || row.longitude == null) {
				return;
			}
			setLocation({
				latitude: row.latitude,
				longitude: row.longitude,
				heading: row.heading ?? null,
				updatedAt: row.updated_at ?? null,
			});
		};

		// Initial fetch — Realtime delivers only subsequent changes.
		void supabase
			.from("order_locations")
			.select("latitude, longitude, heading, updated_at")
			.eq("order_id", orderId)
			.maybeSingle()
			.then(({ data, error }) => {
				if (error) {
					logger.warn("OrderLocation", "initial fetch failed", {
						orderId,
						error: error.message,
					});
					return;
				}
				apply(data as OrderLocationRow | null);
			});

		const channel = supabase
			.channel(`order-location:${orderId}`)
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "order_locations",
					filter: `order_id=eq.${orderId}`,
				},
				(payload) => {
					// A DELETE (or an empty row) means there is no live point anymore.
					if (
						payload.eventType === "DELETE" ||
						!payload.new ||
						Object.keys(payload.new).length === 0
					) {
						if (active) setLocation(null);
						return;
					}
					apply(payload.new as OrderLocationRow);
				},
			)
			.subscribe((status, err) => {
				if (status === "CHANNEL_ERROR") {
					logger.error("OrderLocation", "channel CHANNEL_ERROR", {
						orderId,
						error: err?.message ?? String(err),
					});
				}
			});

		return () => {
			active = false;
			supabase.removeChannel(channel);
		};
	}, [orderId, enabled]);

	return location;
}
