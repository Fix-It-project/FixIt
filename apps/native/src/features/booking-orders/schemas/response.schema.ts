import { z } from "zod";
import { orderStatusSchema } from "./order-status.schema";

export const orderSchema = z.object({
	id: z.string(),
	technician_id: z.string(),
	user_id: z.string(),
	service_id: z.string(),
	scheduled_date: z.string(),
	scheduled_start_at: z.string().nullable().optional(),
	status: orderStatusSchema,
	problem_description: z.string().nullable(),
	attachment: z.string().nullable().optional(),
	cancellation_reason: z.string().nullable().optional(),
	// Optional + defaulted: older API responses may omit this; the hook then
	// falls back to deriving "active" from status.
	active: z.boolean().optional(),
	created_at: z.string(),
	technician_name: z.string().nullable().optional(),
	technician_image: z.string().nullable().optional(),
	technician_phone: z.string().nullable().optional(),
	service_name: z.string().nullable().optional(),
	category_id: z.string().nullable().optional(),
	has_review: z.boolean().default(false),
	has_pending_reschedule: z.boolean().optional(),
	// Phase 4c dual-confirm fields (may not be present on older API responses)
	payment_method: z.enum(["cash", "card"]).nullable().optional(),
	estimated_price: z.number().nullable().optional(),
	final_price: z.number().nullable().optional(),
	work_price: z.number().nullable().optional(),
	inspection_fee: z.number().nullable().optional(),
	inspection_distance_km: z.number().nullable().optional(),
	arrived_at: z.string().nullable().optional(),
	user_completed_at: z.string().nullable().optional(),
	technician_completed_at: z.string().nullable().optional(),
});

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
	service_name: z.string().nullable().optional(),
	category_id: z.string().nullable().optional(),
	has_pending_reschedule: z.boolean().optional(),
	// Phase 4d — dual-confirm fields needed for tech-side WorkInProgress + summary screens.
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

export const orderResponseSchema = z.object({ data: orderSchema });
export const ordersResponseSchema = z.object({ data: z.array(orderSchema) });
export const technicianBookingResponseSchema = z.object({
	data: technicianBookingSchema,
});
export const technicianBookingsResponseSchema = z.object({
	data: z.array(technicianBookingSchema),
});

export type Order = z.infer<typeof orderSchema>;
export type OrderResponse = z.infer<typeof orderResponseSchema>;
export type OrdersResponse = z.infer<typeof ordersResponseSchema>;
export type TechnicianBooking = z.infer<typeof technicianBookingSchema>;
export type TechnicianBookingResponse = z.infer<
	typeof technicianBookingResponseSchema
>;
export type TechnicianBookingsResponse = z.infer<
	typeof technicianBookingsResponseSchema
>;
