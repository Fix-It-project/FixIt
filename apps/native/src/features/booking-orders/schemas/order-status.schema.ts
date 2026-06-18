// Order status schema for the booking-orders feature.
//
// The enum values themselves live in `@/src/schemas/shared.schema` to keep a
// single source of truth aligned with the DB (`public.order_status` from
// supabase/migrations/20260512000000_order_state_machine_phase1_lean.sql).
// This module re-exports them plus feature-specific UI helpers (phase enum and
// IN_PROGRESS / TERMINAL sets).

import { z } from "zod";
import {
	type OrderStatus,
	orderStatusSchema,
} from "../../../schemas/shared.schema";

export type { OrderStatus };
export { orderStatusSchema };

// Canonical UI phase names returned by deriveUiState (Phase 4a D5).
export const uiPhaseSchema = z.enum([
	"waiting_to_accept",
	"tech_on_the_way",
	"tech_inspecting",
	"quote_open",
	"work_in_progress",
	"payment_pending",
	"completed",
	"cancelled",
]);

export type UiPhase = z.infer<typeof uiPhaseSchema>;

// Sets of status values grouped by lifecycle stage — utility for callers that don't want a full mapper.
//
// IN_PROGRESS_STATUSES is intentionally narrow: it represents lifecycle stages
// where the technician is post-accept and physically in motion (tracking) or
// later. The set is pinned by a locked schema test — do NOT widen this set
// without also updating the test and every consumer that relies on its
// semantics (e.g. visible step indicator step ranges, wizard routing).
//
// For "is this order active in any sense the user/tech should care about?"
// (e.g. floating ActiveOrderBubble visibility), use ACTIVE_STATUSES below.
export const IN_PROGRESS_STATUSES: ReadonlySet<OrderStatus> = new Set([
	"tracking",
	"arrived_inspection",
	"awaiting_final_cost",
	"negotiating",
	"in_progress",
	"awaiting_payment",
]);

// ACTIVE_STATUSES = "the order is live and the floating bubble / activity
// surface should be visible". Includes `accepted` (tech has taken the job but
// hasn't started moving yet) on top of IN_PROGRESS_STATUSES. Terminal states
// and `pending` are excluded.
export const ACTIVE_STATUSES: ReadonlySet<OrderStatus> = new Set([
	"accepted",
	"tracking",
	"arrived_inspection",
	"awaiting_final_cost",
	"negotiating",
	"in_progress",
	"awaiting_payment",
]);

// RESCHEDULE_PENDING_STATUSES = the order has a pending reschedule request.
// The order keeps its ORIGINAL scheduled_date until the request is approved
// (reschedule_create only flips `status`, not the date) — so it must still
// appear on the calendar / bookings list for that original date.
export const RESCHEDULE_PENDING_STATUSES: ReadonlySet<OrderStatus> = new Set([
	"reschedule_requested_by_user",
	"reschedule_requested_by_technician",
]);

export const TERMINAL_STATUSES: ReadonlySet<OrderStatus> = new Set([
	"completed",
	"declined_by_technician",
	"cancelled_no_fee",
	"cancelled_with_fee",
	"rejected",
	"cancelled",
	"cancelled_by_user",
	"cancelled_by_technician",
]);
