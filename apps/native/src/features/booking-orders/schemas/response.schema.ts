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
	// Service quote range (null when the service has no configured range).
	service_min_price: z.number().nullable().optional(),
	service_max_price: z.number().nullable().optional(),
	has_review: z.boolean().default(false),
	has_open_report: z.boolean().optional(),
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

// Canonical technician-order schema lives in the shared top-level `schemas/`
// folder so every writer of the shared ["technician-bookings", userId] cache
// (booking-orders, Jobs, the technician schedule) parses with the IDENTICAL
// field set — a narrower parser would silently strip fields for all consumers.
// Re-exported here so existing booking-orders import sites are unchanged.
export {
	type TechnicianBooking,
	type TechnicianBookingResponse,
	type TechnicianBookingsResponse,
	technicianBookingResponseSchema,
	technicianBookingSchema,
	technicianBookingsResponseSchema,
} from "@/src/schemas/technician-order.schema";

export const orderResponseSchema = z.object({ data: orderSchema });
export const ordersResponseSchema = z.object({ data: z.array(orderSchema) });

export type Order = z.infer<typeof orderSchema>;
export type OrderResponse = z.infer<typeof orderResponseSchema>;
export type OrdersResponse = z.infer<typeof ordersResponseSchema>;