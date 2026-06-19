import { z } from "zod";

// Payload returned by GET /api/orders/:id/distance (Phase 04a-04).
// distance_km is null when no order_locations row exists yet; eta_minutes follows.
export const orderDistanceSchema = z.object({
	distance_km: z.number().nullable(),
	eta_minutes: z.number().int().nullable(),
	within_geofence: z.boolean(),
});
export type OrderDistance = z.infer<typeof orderDistanceSchema>;

export const orderDistanceResponseSchema = z.object({
	data: orderDistanceSchema,
});
export type OrderDistanceResponse = z.infer<typeof orderDistanceResponseSchema>;

// Response from POST /api/orders/technician/orders/:id/location (techUpsertLocation).
// Arrival now drives the tech "I've arrived" UX, so the previously-opaque envelope
// is typed. `arrived` is true only on the ping that crosses the 1 km threshold;
// `order` is kept permissive (passthrough) — we only read status + arrived_at here.
export const locationPingSchema = z.object({
	arrived: z.boolean(),
	location: z.unknown(),
	order: z
		.object({
			status: z.string().optional(),
			arrived_at: z.string().nullable().optional(),
		})
		.passthrough(),
});
export type LocationPing = z.infer<typeof locationPingSchema>;

export const locationPingResponseSchema = z.object({
	data: locationPingSchema,
});
export type LocationPingResponse = z.infer<typeof locationPingResponseSchema>;
