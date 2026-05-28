import apiClient from "@/src/config/api-client";
import { safeParseResponse } from "@/src/lib/api/safe-parse";
import type {
	OrderDistanceResponse,
	OrderQuoteResponse,
	OrderQuotesResponse,
	OrderResponse,
	OrdersResponse,
	RescheduleNullableResponse,
	RescheduleResponse,
} from "../schemas";
import {
	orderDistanceResponseSchema,
	orderQuoteResponseSchema,
	orderQuotesResponseSchema,
	orderResponseSchema,
	ordersResponseSchema,
	rescheduleNullableResponseSchema,
	rescheduleResponseSchema,
} from "../schemas";
import type { CreateOrderPayload } from "../types/order";

// ─── Existing transport (preserved) ─────────────────────────────────────────

export interface CreateOrderOptions {
	payload: CreateOrderPayload;
	attachment?: { uri: string; name: string; type: string };
}

export async function createOrder(
	options: CreateOrderOptions,
): Promise<OrderResponse> {
	const { payload, attachment } = options;

	if (attachment) {
		const form = new FormData();
		form.append("technician_id", payload.technician_id);
		form.append("service_id", payload.service_id);
		form.append("scheduled_date", payload.scheduled_date);
		form.append("scheduled_start_at", payload.scheduled_start_at);
		if (payload.destination_address_id) {
			form.append("destination_address_id", payload.destination_address_id);
		}
		if (payload.problem_description) {
			form.append("problem_description", payload.problem_description);
		}
		form.append("attachment", {
			uri: attachment.uri,
			name: attachment.name,
			type: attachment.type,
		} as any);

		const response = await apiClient.post("/api/orders/user/orders", form, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return safeParseResponse(orderResponseSchema, response.data, "createOrder");
	}

	const response = await apiClient.post("/api/orders/user/orders", payload);
	return safeParseResponse(orderResponseSchema, response.data, "createOrder");
}

export async function getUserOrders(): Promise<OrdersResponse> {
	const response = await apiClient.get("/api/orders/user/orders");
	return safeParseResponse(
		ordersResponseSchema,
		response.data,
		"getUserOrders",
	);
}

export async function cancelUserOrder(
	orderId: string,
	reason?: string,
): Promise<OrderResponse> {
	const response = await apiClient.patch(`/api/orders/user/orders/${orderId}`, {
		cancel: true,
		...(reason && { cancellation_reason: reason }),
	});
	return safeParseResponse(
		orderResponseSchema,
		response.data,
		"cancelUserOrder",
	);
}

// ─── Distance / ETA ─────────────────────────────────────────────────────────

export async function getOrderDistance(
	orderId: string,
): Promise<OrderDistanceResponse> {
	const response = await apiClient.get(
		`/api/orders/user/orders/${orderId}/distance`,
	);
	return safeParseResponse(
		orderDistanceResponseSchema,
		response.data,
		"getOrderDistance",
	);
}

// ─── Lifecycle mutations (user) ─────────────────────────────────────────────
//
// Endpoint URLs verified against apps/server/src/modules/orders/lifecycle/lifecycle.routes.ts
// and apps/server/src/modules/orders/reschedule.routes.ts.

/**
 * Lifecycle cancel verb (Phase 2): POST /user/orders/:id/cancel.
 * Distinct from `cancelUserOrder` above, which uses the legacy PATCH shim.
 * Both are preserved during the 4a transition; callers should migrate to this.
 */
export async function userCancelOrder(
	orderId: string,
	reason?: string,
): Promise<OrderResponse> {
	const response = await apiClient.post(
		`/api/orders/user/orders/${orderId}/cancel`,
		reason ? { reason } : {},
	);
	return safeParseResponse(
		orderResponseSchema,
		response.data,
		"userCancelOrder",
	);
}

/**
 * POST /user/orders/:id/reschedule (reschedule.routes.ts).
 * Body: {
 *   proposed_scheduled_date (YYYY-MM-DD),
 *   proposed_scheduled_start_at (ISO datetime),
 *   reason (required)
 * }.
 *
 * Returns the created `reschedule_requests` row, not an order.
 */
export async function userRequestReschedule(
	orderId: string,
	proposedScheduledDate: string,
	proposedScheduledStartAt: string,
	reason: string,
): Promise<RescheduleResponse> {
	const response = await apiClient.post(
		`/api/orders/user/orders/${orderId}/reschedule`,
		{
			proposed_scheduled_date: proposedScheduledDate,
			proposed_scheduled_start_at: proposedScheduledStartAt,
			reason,
		},
	);
	return safeParseResponse(
		rescheduleResponseSchema,
		response.data,
		"userRequestReschedule",
	);
}

export async function userApproveReschedule(
	orderId: string,
): Promise<RescheduleResponse> {
	const response = await apiClient.post(
		`/api/orders/user/orders/${orderId}/reschedule/approve`,
		{},
	);
	return safeParseResponse(
		rescheduleResponseSchema,
		response.data,
		"userApproveReschedule",
	);
}

export async function userRejectReschedule(
	orderId: string,
	reason: string,
): Promise<RescheduleResponse> {
	const response = await apiClient.post(
		`/api/orders/user/orders/${orderId}/reschedule/reject`,
		{ reason },
	);
	return safeParseResponse(
		rescheduleResponseSchema,
		response.data,
		"userRejectReschedule",
	);
}

export async function userWithdrawReschedule(
	orderId: string,
): Promise<RescheduleResponse> {
	const response = await apiClient.post(
		`/api/orders/user/orders/${orderId}/reschedule/withdraw`,
		{},
	);
	return safeParseResponse(
		rescheduleResponseSchema,
		response.data,
		"userWithdrawReschedule",
	);
}

export async function userGetReschedule(
	orderId: string,
): Promise<RescheduleNullableResponse> {
	const response = await apiClient.get(
		`/api/orders/user/orders/${orderId}/reschedule`,
	);
	return safeParseResponse(
		rescheduleNullableResponseSchema,
		response.data,
		"userGetReschedule",
	);
}

/**
 * POST /user/orders/:id/checkout — choose payment method.
 * Phase 2 is cash-only; server enforces z.literal('cash').
 */
export async function userCheckout(
	orderId: string,
	method: "cash" | "card" = "cash",
): Promise<OrderResponse> {
	const response = await apiClient.post(
		`/api/orders/user/orders/${orderId}/checkout`,
		{ method },
	);
	return safeParseResponse(orderResponseSchema, response.data, "userCheckout");
}

/**
 * POST /user/orders/:id/quotes — submit a quote from the user side.
 * `notes` is optional.
 */
export async function userSubmitQuote(
	orderId: string,
	amount: number,
	notes?: string,
): Promise<OrderQuoteResponse> {
	const response = await apiClient.post(
		`/api/orders/user/orders/${orderId}/quotes`,
		{ amount, ...(notes !== undefined && { notes }) },
	);
	return safeParseResponse(
		orderQuoteResponseSchema,
		response.data,
		"userSubmitQuote",
	);
}

/**
 * Countering is modelled server-side as submitting a new quote in the next round.
 * There is no dedicated `/quotes/counter` route — `POST /quotes` handles both
 * initial submission and counters (round number auto-incremented by service).
 *
 * Divergence from plan: kept the `userCounterQuote` function name for hook
 * ergonomics but it targets the same endpoint as `userSubmitQuote`.
 */
export async function userCounterQuote(
	orderId: string,
	amount: number,
	notes?: string,
): Promise<OrderQuoteResponse> {
	const response = await apiClient.post(
		`/api/orders/user/orders/${orderId}/quotes`,
		{ amount, ...(notes !== undefined && { notes }) },
	);
	return safeParseResponse(
		orderQuoteResponseSchema,
		response.data,
		"userCounterQuote",
	);
}

/**
 * POST /user/orders/:id/quotes/:quoteId/accept.
 *
 * The controller returns the updated *Order* (status flipped to `in_progress`),
 * NOT the quote — see apps/server/src/modules/orders/lifecycle/lifecycle.controller.ts
 * `userAcceptQuote`. The previous schema (orderQuoteResponseSchema) caused
 * Zod validation failures at the boundary because the payload has no
 * `proposed_by` / `round_number` / `amount`. Parse with orderResponseSchema.
 */
export async function userAcceptQuote(
	orderId: string,
	quoteId: string,
): Promise<OrderResponse> {
	const response = await apiClient.post(
		`/api/orders/user/orders/${orderId}/quotes/${quoteId}/accept`,
	);
	return safeParseResponse(
		orderResponseSchema,
		response.data,
		"userAcceptQuote",
	);
}

/**
 * POST /user/orders/:id/confirm-completion — user confirms job done.
 * In Phase 2 cash flow this is also the implicit payment-received signal
 * (no separate `/confirm-paid` route exists; see SUMMARY divergences).
 */
export async function userConfirmCompletion(
	orderId: string,
): Promise<OrderResponse> {
	const response = await apiClient.post(
		`/api/orders/user/orders/${orderId}/confirm-completion`,
		{},
	);
	return safeParseResponse(
		orderResponseSchema,
		response.data,
		"userConfirmCompletion",
	);
}

/**
 * POST /user/orders/:id/decline-completion — user rejects technician's pending
 * mark-complete request. Clears `technician_completed_at`, keeps status='in_progress'.
 */
export async function userDeclineCompletion(
	orderId: string,
): Promise<OrderResponse> {
	const response = await apiClient.post(
		`/api/orders/user/orders/${orderId}/decline-completion`,
		{},
	);
	return safeParseResponse(
		orderResponseSchema,
		response.data,
		"userDeclineCompletion",
	);
}

// ─── Quote history (user) ──────────────────────────────────────────────────

export async function getUserOrderQuotes(
	orderId: string,
): Promise<OrderQuotesResponse> {
	const response = await apiClient.get(
		`/api/orders/user/orders/${orderId}/quotes`,
	);
	return safeParseResponse(
		orderQuotesResponseSchema,
		response.data,
		"getUserOrderQuotes",
	);
}
