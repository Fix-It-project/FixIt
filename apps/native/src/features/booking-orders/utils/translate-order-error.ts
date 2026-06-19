/**
 * Translates backend error tokens (raised by `AppError.badRequest/conflict/forbidden`
 * and surfaced as `{ error: "<token>" }` in the response body) into user-facing English.
 *
 * Unknown tokens fall through to the raw message so dev logs still capture them.
 */

import type { AxiosError } from "axios";
import { getErrorMessage } from "@/src/lib/errors";

type ErrorPayload = {
	error?:
		| string
		| {
				code?: string;
				hint?: string;
				message?: string;
		  };
	details?: unknown;
	message?: string;
};

const TOKEN_MESSAGES: Record<string, string> = {
	// Reschedule — validation chain (reschedule.service.ts)
	order_not_in_accepted_state:
		"This order isn't in an accepted state, so it can't be rescheduled right now.",
	reschedule_already_pending:
		"A reschedule request is already pending for this order.",
	tech_unavailable: "The technician isn't available on that date.",
	cap_exhausted_for_date: "The technician is fully booked on that date.",
	proposed_not_after_original: "Pick a date after the original.",
	proposed_within_24h_buffer: "Pick a date at least 24 hours from now.",
	original_within_24h_buffer:
		"The original date is too close — rescheduling needs a 24h buffer.",
	proposed_not_in_future: "Pick a date in the future.",
	reason_required: "Add a reason before submitting.",
	reason_too_long: "Reason must be 500 characters or fewer.",
	reschedule_not_found: "That reschedule request no longer exists.",
	reschedule_already_resolved:
		"This reschedule request has already been resolved.",
	reschedule_resolution_changed_concurrently:
		"The reschedule request changed elsewhere. Please refresh.",
	order_status_changed_concurrently:
		"The order changed elsewhere. Please refresh.",
	order_status_inconsistent: "The order status is out of sync. Please refresh.",
	request_expired: "That request has expired.",

	// Booking submit (rpc_submit_order guards)
	service_not_offered_by_technician:
		"This technician doesn't offer that service. Please pick another.",
	slot_taken: "That time slot was just booked. Please choose another.",
	booking_must_be_future: "Bookings must be for the next day or later.",
	price_out_of_range: "Enter a price within the service's listed range.",
	inspection_fee_pricing_unavailable:
		"We couldn't calculate the inspection fee for this booking. Please update the saved locations and try again.",

	// Lifecycle / tracking (lifecycle.repository.ts)
	cannot_submit_order_unpaid_fee:
		"Your account has an unpaid inspection cancellation fee. Clear or waive it before placing a new order.",
	technician_already_tracking_another_order:
		"You already have an order being tracked. Finish it first before starting another.",
	cannot_cancel_from_status:
		"This order can't be cancelled from its current state.",
	no_completion_pending: "There's no pending completion request to act on.",
	no_cash_payment_pending: "There's no pending cash payment for this order.",
	missing_final_price: "A final price is required to complete this order.",

	// Auth / authz
	not_initiator: "You aren't allowed to perform this action on this order.",
	not_counterparty: "You aren't allowed to perform this action on this order.",
	forbidden_not_order_owner:
		"You aren't allowed to perform this action on this order.",
	invalid_actor: "You aren't allowed to perform this action on this order.",

	// Not-found
	order_not_found: "We couldn't find that order.",
};

/**
 * Pulls the structured server token from an Axios error and translates it.
 * Falls back to error.message (or the literal token) when unrecognised.
 */
export function translateOrderError(error: unknown): string {
	const axiosErr = error as AxiosError<ErrorPayload> | undefined;
	const rawError = axiosErr?.response?.data?.error;
	const token =
		typeof rawError === "string"
			? rawError
			: (rawError?.code ?? axiosErr?.response?.data?.message);
	if (token && TOKEN_MESSAGES[token]) {
		return TOKEN_MESSAGES[token];
	}
	if (rawError && typeof rawError === "object" && rawError.message) {
		return rawError.message;
	}
	if (token) return token;
	return getErrorMessage(error);
}

/** Convenience: read just the raw token (for logging / branch checks). */
export function extractOrderErrorToken(error: unknown): string | undefined {
	const axiosErr = error as AxiosError<ErrorPayload> | undefined;
	const rawError = axiosErr?.response?.data?.error;
	return typeof rawError === "string" ? rawError : rawError?.code;
}
