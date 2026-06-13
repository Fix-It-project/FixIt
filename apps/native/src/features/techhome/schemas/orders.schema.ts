import { z } from "zod";
import {
	type OrderStatus,
	orderStatusSchema,
} from "../../../schemas/shared.schema";

export type { OrderStatus } from "../../../schemas/shared.schema";

/**
 * Technician order as returned by GET /api/orders/technician/orders.
 *
 * CACHE CONTRACT: this query writes into the SHARED ["technician-bookings", userId]
 * cache also populated by the booking-orders feature. The field set below mirrors
 * booking-orders' technicianBookingSchema one-for-one — Zod strips unknown keys,
 * so dropping a field here would silently strip it for every consumer of that
 * cache. Keep the two schemas field-identical.
 */
export const techHomeOrderSchema = z.object({
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
	active: z.boolean().optional(),
	created_at: z.string().optional(),
	arrived_at: z.string().nullable().optional(),
	final_price: z.number().nullable().optional(),
	payment_method: z.enum(["cash", "card"]).nullable().optional(),
	user_completed_at: z.string().nullable().optional(),
	technician_completed_at: z.string().nullable().optional(),
});

export const techHomeOrdersResponseSchema = z.object({
	data: z.array(techHomeOrderSchema),
});
export const techHomeOrderResponseSchema = z.object({
	data: techHomeOrderSchema,
});

export type TechHomeOrder = z.infer<typeof techHomeOrderSchema>;

/** Statuses meaning "technician is actively working this order right now". */
export const ACTIVE_JOB_STATUSES: ReadonlySet<OrderStatus> = new Set([
	"tracking",
	"arrived_inspection",
	"awaiting_final_cost",
	"negotiating",
	"in_progress",
	"awaiting_payment",
]);

/** Statuses that belong on today's schedule timeline. */
export const SCHEDULED_STATUSES: ReadonlySet<OrderStatus> = new Set([
	"accepted",
	"tracking",
	"arrived_inspection",
	"awaiting_final_cost",
	"negotiating",
	"in_progress",
	"awaiting_payment",
	"completed",
]);
