import { z } from "zod";
import { orderStatusSchema } from "@/src/schemas/shared.schema";

/**
 * CANONICAL technician order shape returned by GET /api/orders/technician/orders.
 *
 * This is the SINGLE source of truth for any consumer that writes the shared
 * `["technician-bookings", userId]` React Query cache (booking-orders, Jobs,
 * the technician schedule). Zod strips unknown keys, so a consumer that parsed
 * the same cache with a NARROWER schema would silently drop fields for everyone.
 * Every writer of that cache MUST import this schema — never redefine a slimmer
 * one. (booking-orders re-exports this; techhome keeps a field-identical copy.)
 */
export const technicianBookingSchema = z.object({
	id: z.string(),
	status: orderStatusSchema,
	scheduled_date: z.string(),
	scheduled_start_at: z.string().nullable().optional(),
	problem_description: z.string().nullable(),
	attachment: z.string().nullable().optional(),
	cancellation_reason: z.string().nullable().optional(),
	user_name: z.string().nullable().optional(),
	user_phone: z.string().nullable().optional(),
	user_address: z.string().nullable().optional(),
	user_latitude: z.number().nullable().optional(),
	user_longitude: z.number().nullable().optional(),
	service_name: z.string().nullable().optional(),
	category_id: z.string().nullable().optional(),
	has_pending_reschedule: z.boolean().optional(),
	active: z.boolean().optional(),
	created_at: z.string().optional(),
	arrived_at: z.string().nullable().optional(),
	final_price: z.number().nullable().optional(),
	work_price: z.number().nullable().optional(),
	inspection_fee: z.number().nullable().optional(),
	inspection_distance_km: z.number().nullable().optional(),
	payment_method: z.enum(["cash", "card"]).nullable().optional(),
	user_completed_at: z.string().nullable().optional(),
	technician_completed_at: z.string().nullable().optional(),
});

export const technicianBookingResponseSchema = z.object({
	data: technicianBookingSchema,
});
export const technicianBookingsResponseSchema = z.object({
	data: z.array(technicianBookingSchema),
});

export type TechnicianBooking = z.infer<typeof technicianBookingSchema>;
export type TechnicianBookingResponse = z.infer<
	typeof technicianBookingResponseSchema
>;
export type TechnicianBookingsResponse = z.infer<
	typeof technicianBookingsResponseSchema
>;
