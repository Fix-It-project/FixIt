import { z } from "zod";
import apiClient from "@/src/config/api-client";
import { safeParseResponse } from "@/src/lib/api/safe-parse";
import type {
	OrderDistanceResponse,
	OrderQuoteResponse,
	OrderQuotesResponse,
	OrderResponse,
	RescheduleNullableResponse,
	RescheduleResponse,
} from "../schemas";
import {
	orderDistanceResponseSchema,
	orderQuoteResponseSchema,
	orderQuotesResponseSchema,
	orderResponseSchema,
	rescheduleNullableResponseSchema,
	rescheduleResponseSchema,
} from "../schemas";
import {
	type TechnicianBooking,
	technicianBookingResponseSchema,
	technicianBookingsResponseSchema,
} from "../schemas/response.schema";

// ─── Existing transport (preserved) ─────────────────────────────────────────

export async function getTechnicianBookings(
	_technicianId: string,
): Promise<TechnicianBooking[]> {
	const response = await apiClient.get("/api/orders/technician/orders");
	return safeParseResponse(
		technicianBookingsResponseSchema,
		response.data,
		"getTechnicianBookings",
	).data;
}

export async function updateTechnicianBookingStatus(
	orderId: string,
	status: "accepted" | "rejected" | "cancelled_by_technician" | "completed",
	cancellation_reason?: string,
): Promise<TechnicianBooking> {
	const response = await apiClient.patch(
		`/api/orders/technician/orders/${orderId}`,
		{
			status,
			...(cancellation_reason !== undefined && { cancellation_reason }),
		},
	);

	return safeParseResponse(
		technicianBookingResponseSchema,
		response.data,
		"updateTechnicianBookingStatus",
	).data;
}

// ─── Distance / ETA ─────────────────────────────────────────────────────────

export async function getTechOrderDistance(
	orderId: string,
): Promise<OrderDistanceResponse> {
	const response = await apiClient.get(
		`/api/orders/technician/orders/${orderId}/distance`,
	);
	return safeParseResponse(
		orderDistanceResponseSchema,
		response.data,
		"getTechOrderDistance",
	);
}

// ─── Location ping (reuses existing /location endpoint) ────────────────────
//
// IMPORTANT: This function deliberately targets the EXISTING
// POST /api/orders/technician/orders/:id/location route (added in Phase 2,
// validated by UpsertLocationBodySchema). Plan 04a-05 does NOT add a new
// /location-ping route; the name `postTechLocationPing` is just intent-clear
// from the caller's perspective — the underlying URL is `/location`.

/**
 * Backend `techUpsertLocation` returns `{ data: <row-from-order_locations> }`
 * with an opaque shape; we don't depend on the body, only the envelope. A
 * permissive schema is defined inline (not promoted to a shared schema file)
 * because the response is internal-only — hooks discard it.
 */
const orderLocationResponseSchema = z.object({
	data: z.unknown(),
});

export interface TechLocationPingCoords {
	latitude: number;
	longitude: number;
	heading?: number;
	accuracy?: number;
}

export async function postTechLocationPing(
	orderId: string,
	coords: TechLocationPingCoords,
): Promise<{ data: unknown }> {
	const response = await apiClient.post(
		`/api/orders/technician/orders/${orderId}/location`,
		{
			latitude: coords.latitude,
			longitude: coords.longitude,
			...(coords.heading !== undefined && { heading: coords.heading }),
			...(coords.accuracy !== undefined && { accuracy: coords.accuracy }),
		},
	);
	return safeParseResponse(
		orderLocationResponseSchema,
		response.data,
		"postTechLocationPing",
	);
}

// ─── Lifecycle mutations (technician) ──────────────────────────────────────
//
// Endpoint URLs verified against apps/server/src/modules/orders/lifecycle/lifecycle.routes.ts.

export async function techAccept(orderId: string): Promise<OrderResponse> {
	const response = await apiClient.post(
		`/api/orders/technician/orders/${orderId}/accept`,
	);
	return safeParseResponse(orderResponseSchema, response.data, "techAccept");
}

export async function techDecline(
	orderId: string,
	reason?: string,
): Promise<OrderResponse> {
	const response = await apiClient.post(
		`/api/orders/technician/orders/${orderId}/decline`,
		reason ? { reason } : {},
	);
	return safeParseResponse(orderResponseSchema, response.data, "techDecline");
}

export async function techCancel(
	orderId: string,
	reason?: string,
): Promise<OrderResponse> {
	const response = await apiClient.post(
		`/api/orders/technician/orders/${orderId}/cancel`,
		reason ? { reason } : {},
	);
	return safeParseResponse(orderResponseSchema, response.data, "techCancel");
}

export async function techStartTracking(
	orderId: string,
): Promise<OrderResponse> {
	const response = await apiClient.post(
		`/api/orders/technician/orders/${orderId}/start-tracking`,
	);
	return safeParseResponse(
		orderResponseSchema,
		response.data,
		"techStartTracking",
	);
}

/**
 * POST /technician/orders/:id/start-inspection — "tech marked arrived /
 * starting inspection". Function named `techMarkArrived` for caller clarity.
 */
export async function techMarkArrived(orderId: string): Promise<OrderResponse> {
	const response = await apiClient.post(
		`/api/orders/technician/orders/${orderId}/start-inspection`,
	);
	return safeParseResponse(
		orderResponseSchema,
		response.data,
		"techMarkArrived",
	);
}

export async function techFinishInspection(
	orderId: string,
): Promise<OrderResponse> {
	const response = await apiClient.post(
		`/api/orders/technician/orders/${orderId}/finish-inspection`,
	);
	return safeParseResponse(
		orderResponseSchema,
		response.data,
		"techFinishInspection",
	);
}

export async function techSubmitQuote(
	orderId: string,
	amount: number,
	notes?: string,
): Promise<OrderQuoteResponse> {
	const response = await apiClient.post(
		`/api/orders/technician/orders/${orderId}/quotes`,
		{ amount, ...(notes !== undefined && { notes }) },
	);
	return safeParseResponse(
		orderQuoteResponseSchema,
		response.data,
		"techSubmitQuote",
	);
}

/**
 * Same endpoint as `techSubmitQuote` — countering is modelled as a new quote
 * in the next round (server auto-increments round_number). See SUMMARY for
 * divergence note.
 */
export async function techCounterQuote(
	orderId: string,
	amount: number,
	notes?: string,
): Promise<OrderQuoteResponse> {
	const response = await apiClient.post(
		`/api/orders/technician/orders/${orderId}/quotes`,
		{ amount, ...(notes !== undefined && { notes }) },
	);
	return safeParseResponse(
		orderQuoteResponseSchema,
		response.data,
		"techCounterQuote",
	);
}

/**
 * POST /technician/orders/:id/quotes/:quoteId/accept.
 *
 * The controller returns the updated *Order* (status flipped to `in_progress`),
 * NOT the quote — see apps/server/src/modules/orders/lifecycle/lifecycle.controller.ts
 * `techAcceptQuote`. The previous schema (orderQuoteResponseSchema) caused
 * Zod validation failures at the boundary. Parse with orderResponseSchema.
 */
export async function techAcceptUserQuote(
	orderId: string,
	quoteId: string,
): Promise<OrderResponse> {
	const response = await apiClient.post(
		`/api/orders/technician/orders/${orderId}/quotes/${quoteId}/accept`,
	);
	return safeParseResponse(
		orderResponseSchema,
		response.data,
		"techAcceptUserQuote",
	);
}

export async function techConfirmCompletion(
	orderId: string,
): Promise<OrderResponse> {
	const response = await apiClient.post(
		`/api/orders/technician/orders/${orderId}/confirm-completion`,
		{},
	);
	return safeParseResponse(
		orderResponseSchema,
		response.data,
		"techConfirmCompletion",
	);
}

/**
 * POST /technician/orders/:id/decline-completion — technician rejects user's
 * pending mark-complete request. Clears `user_completed_at`, keeps status='in_progress'.
 */
export async function techDeclineCompletion(
	orderId: string,
): Promise<OrderResponse> {
	const response = await apiClient.post(
		`/api/orders/technician/orders/${orderId}/decline-completion`,
		{},
	);
	return safeParseResponse(
		orderResponseSchema,
		response.data,
		"techDeclineCompletion",
	);
}

/**
 * POST /technician/orders/:id/mark-cash-received.
 *
 * Divergence from plan: server route is `/mark-cash-received` (not
 * `/confirm-cash-received`). Function name kept as `techConfirmCashReceived`
 * for caller ergonomics.
 */
export async function techConfirmCashReceived(
	orderId: string,
): Promise<OrderResponse> {
	const response = await apiClient.post(
		`/api/orders/technician/orders/${orderId}/mark-cash-received`,
	);
	return safeParseResponse(
		orderResponseSchema,
		response.data,
		"techConfirmCashReceived",
	);
}

// ─── Quote history (technician) ────────────────────────────────────────────

export async function getTechOrderQuotes(
	orderId: string,
): Promise<OrderQuotesResponse> {
	const response = await apiClient.get(
		`/api/orders/technician/orders/${orderId}/quotes`,
	);
	return safeParseResponse(
		orderQuotesResponseSchema,
		response.data,
		"getTechOrderQuotes",
	);
}

// ─── Reschedule (technician) ───────────────────────────────────────────────

export async function techRequestReschedule(
	orderId: string,
	proposedScheduledDate: string,
	proposedScheduledStartAt: string,
	reason: string,
): Promise<RescheduleResponse> {
	const response = await apiClient.post(
		`/api/orders/technician/orders/${orderId}/reschedule`,
		{
			proposed_scheduled_date: proposedScheduledDate,
			proposed_scheduled_start_at: proposedScheduledStartAt,
			reason,
		},
	);
	return safeParseResponse(
		rescheduleResponseSchema,
		response.data,
		"techRequestReschedule",
	);
}

export async function techApproveReschedule(
	orderId: string,
): Promise<RescheduleResponse> {
	const response = await apiClient.post(
		`/api/orders/technician/orders/${orderId}/reschedule/approve`,
		{},
	);
	return safeParseResponse(
		rescheduleResponseSchema,
		response.data,
		"techApproveReschedule",
	);
}

export async function techRejectReschedule(
	orderId: string,
	reason: string,
): Promise<RescheduleResponse> {
	const response = await apiClient.post(
		`/api/orders/technician/orders/${orderId}/reschedule/reject`,
		{ reason },
	);
	return safeParseResponse(
		rescheduleResponseSchema,
		response.data,
		"techRejectReschedule",
	);
}

export async function techWithdrawReschedule(
	orderId: string,
): Promise<RescheduleResponse> {
	const response = await apiClient.post(
		`/api/orders/technician/orders/${orderId}/reschedule/withdraw`,
		{},
	);
	return safeParseResponse(
		rescheduleResponseSchema,
		response.data,
		"techWithdrawReschedule",
	);
}

export async function techGetReschedule(
	orderId: string,
): Promise<RescheduleNullableResponse> {
	const response = await apiClient.get(
		`/api/orders/technician/orders/${orderId}/reschedule`,
	);
	return safeParseResponse(
		rescheduleNullableResponseSchema,
		response.data,
		"techGetReschedule",
	);
}
