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
