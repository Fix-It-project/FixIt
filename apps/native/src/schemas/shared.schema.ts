import { z } from "zod";

// Mirror of public.order_status enum from
// supabase/migrations/20260512000000_order_state_machine_phase1_lean.sql
// Single source of truth for shared order status values across features.
// The richer typed re-export (with helper sets like IN_PROGRESS_STATUSES /
// TERMINAL_STATUSES) lives in `features/booking-orders/schemas/order-status.schema.ts`.
export const orderStatusSchema = z.enum([
	// New lifecycle (Phase 1)
	"pending",
	"accepted",
	"tracking",
	"arrived_inspection",
	"awaiting_final_cost",
	"negotiating",
	"in_progress",
	"awaiting_payment",
	"completed",
	"declined_by_technician",
	"cancelled_no_fee",
	"cancelled_with_fee",
	// Legacy compat statuses preserved in the DB enum for backward compatibility
	// with pre-lifecycle rows.
	"reschedule_requested_by_user",
	"reschedule_requested_by_technician",
	"rejected",
	"cancelled",
	"cancelled_by_user",
	"cancelled_by_technician",
]);
export type OrderStatus = z.infer<typeof orderStatusSchema>;

export const authSessionSchema = z.object({
	accessToken: z.string(),
	refreshToken: z.string(),
	expiresAt: z.number(),
});
export type AuthSession = z.infer<typeof authSessionSchema>;
