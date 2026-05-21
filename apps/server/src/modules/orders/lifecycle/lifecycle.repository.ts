import { supabaseAdmin } from "../../../shared/db/supabase.js";
import { AppError } from "../../../shared/errors/index.js";
import type { Order } from "../orders.repository.js";

const supabase = supabaseAdmin;

// ─── Row types (minimal shapes — only fields backend reads) ─────────────────

export type ActorRole = "user" | "technician";
export type OrderActionKind =
	| "tech_accept"
	| "tech_decline"
	| "tech_start_tracking"
	| "tech_start_inspection"
	| "tech_finish_inspection";
export type PaymentMethod = "cash" | "card";
export type PaymentStatus =
	| "created"
	| "pending"
	| "paid"
	| "failed"
	| "refunded";
export type QuoteStatus = "pending" | "accepted" | "rejected" | "superseded";
export type FeeObligationStatus = "unpaid" | "paid" | "waived";

export interface OrderLocation {
	id: string;
	order_id: string;
	technician_id: string;
	latitude: number;
	longitude: number;
	heading: number | null;
	accuracy: number | null;
	created_at: string;
}

export interface OrderQuote {
	id: string;
	order_id: string;
	round_number: number;
	proposed_by: ActorRole;
	proposer_id: string;
	amount: number;
	notes: string | null;
	status: QuoteStatus;
	created_at: string;
	resolved_at: string | null;
}

export interface Payment {
	id: string;
	order_id: string;
	user_id: string;
	amount: number;
	method: PaymentMethod;
	status: PaymentStatus;
	provider: string | null;
	provider_transaction_id: string | null;
	created_at: string;
}

export interface UserFeeObligation {
	id: string;
	user_id: string;
	amount: number;
	status: FeeObligationStatus;
	reason: string | null;
	created_at: string;
	resolved_at: string | null;
}

// ─── RPC argument shapes ─────────────────────────────────────────────────────

export interface SubmitOrderParams {
	userId: string;
	technicianId: string;
	serviceId: string;
	destinationAddressId: string;
	problemDescription?: string | null;
	attachment?: string | null;
	scheduledDate: string;
	scheduledStartAt?: string | null;
}

export interface OrderActionParams {
	orderId: string;
	actorId: string;
	actorRole?: ActorRole;
	action: OrderActionKind;
	reason?: string | null;
}

export interface UpsertLocationParams {
	orderId: string;
	technicianId: string;
	latitude: number;
	longitude: number;
	heading?: number | null;
	accuracy?: number | null;
}

export interface SubmitQuoteParams {
	orderId: string;
	actorId: string;
	actorRole: ActorRole;
	amount: number;
	notes?: string | null;
}

export interface AcceptQuoteParams {
	quoteId: string;
	actorId: string;
	actorRole: ActorRole;
}

export interface ConfirmCompletionParams {
	orderId: string;
	actorId: string;
	actorRole: ActorRole;
}

export interface ChoosePaymentMethodParams {
	orderId: string;
	userId: string;
	method: PaymentMethod;
}

export interface MarkCashReceivedParams {
	orderId: string;
	technicianId: string;
}

export interface CancelOrderParams {
	orderId: string;
	actorId: string;
	actorRole: ActorRole;
	reason?: string | null;
}

export interface ResolveFeeObligationParams {
	obligationId: string;
	status: "paid" | "waived";
}

// ─── Error mapping ───────────────────────────────────────────────────────────

/**
 * Map a Supabase RPC error (raised as `RAISE EXCEPTION '<code>'` with
 * ERRCODE P0001 inside the Phase-1 migration) to an `AppError`. Mirrors
 * `mapRpcError` in `reschedule.repository.ts`.
 *
 * Order matters: longer / more specific tokens MUST be checked before
 * substrings of themselves. The matched-substring approach is identical
 * to the reschedule mapper and preserves the machine-readable code in
 * `error.message` for native clients.
 *
 * For `too_far_from_destination` we preserve `error.hint` (the Postgres
 * function attaches `HINT current distance N.NN km`) so the client can
 * surface a precise message.
 */
export function mapLifecycleRpcError(error: {
	code?: string;
	message?: string;
	hint?: string;
}): never {
	const msg = error.message ?? "";

	// Submit-time guards (most specific first — order_not_found_or_not_owner
	// must come before order_not_found / not_owner substrings).
	if (msg.includes("cannot_submit_order_unpaid_fee"))
		throw AppError.conflict("cannot_submit_order_unpaid_fee");
	if (msg.includes("destination_address_not_owned_by_user"))
		throw AppError.forbidden("destination_address_not_owned_by_user");
	if (msg.includes("order_not_found_or_not_owner"))
		throw AppError.notFound("order_not_found_or_not_owner");

	// Generic ownership / lookup.
	if (msg.includes("order_not_found"))
		throw AppError.notFound("order_not_found");
	if (msg.includes("not_owner")) throw AppError.forbidden("not_owner");

	// Bad input shapes.
	if (msg.includes("bad_actor_role"))
		throw AppError.badRequest("bad_actor_role");
	if (msg.includes("bad_payment_method"))
		throw AppError.badRequest("bad_payment_method");
	if (msg.includes("bad_order_action"))
		throw AppError.badRequest("bad_order_action");
	if (msg.includes("bad_status")) throw AppError.badRequest("bad_status");

	// State-machine violations.
	if (msg.includes("invalid_transition"))
		throw AppError.conflict("invalid_transition");
	if (msg.includes("arrival_not_detected_yet"))
		throw AppError.conflict("arrival_not_detected_yet");
	if (msg.includes("too_far_from_destination")) {
		const hint = error.hint ? `:${error.hint}` : "";
		throw AppError.conflict(`too_far_from_destination${hint}`);
	}
	if (msg.includes("location_updates_only_allowed_while_tracking"))
		throw AppError.conflict("location_updates_only_allowed_while_tracking");
	if (msg.includes("technician_already_has_active_order"))
		throw AppError.conflict("technician_already_has_active_order");
	if (msg.includes("technician_already_tracking_another_order"))
		throw AppError.conflict("technician_already_tracking_another_order");
	if (msg.includes("earlier_order_not_completed"))
		throw AppError.conflict("earlier_order_not_completed");

	// Quote-flow guards.
	if (msg.includes("quote_not_found"))
		throw AppError.notFound("quote_not_found");
	if (msg.includes("quote_not_pending"))
		throw AppError.conflict("quote_not_pending");
	if (msg.includes("cannot_accept_own_quote"))
		throw AppError.badRequest("cannot_accept_own_quote");
	if (msg.includes("cannot_cancel_from_status"))
		throw AppError.badRequest("cannot_cancel_from_status");
	if (msg.includes("wrong_actor_for_round"))
		throw AppError.badRequest("wrong_actor_for_round");
	if (msg.includes("max_quote_rounds_reached"))
		throw AppError.conflict("max_quote_rounds_reached");

	// Completion / payment / fees.
	if (msg.includes("missing_final_price"))
		throw AppError.conflict("missing_final_price");
	if (msg.includes("no_cash_payment_pending"))
		throw AppError.conflict("no_cash_payment_pending");
	if (msg.includes("no_completion_pending"))
		throw AppError.conflict("no_completion_pending");
	if (msg.includes("fee_not_unpaid")) throw AppError.conflict("fee_not_unpaid");

	// Unknown error — rethrow as-is (mirrors reschedule mapper's final `throw error`).
	throw error;
}

// ─── Repository ──────────────────────────────────────────────────────────────

export class LifecycleRepository {
	async submitOrder(p: SubmitOrderParams): Promise<Order> {
		const { data, error } = await supabase.rpc("rpc_submit_order", {
			p_user_id: p.userId,
			p_technician_id: p.technicianId,
			p_service_id: p.serviceId,
			p_destination_address_id: p.destinationAddressId,
			p_problem_description: p.problemDescription ?? null,
			p_attachment: p.attachment ?? null,
			p_scheduled_date: p.scheduledDate,
			p_scheduled_start_at: p.scheduledStartAt ?? null,
		});
		if (error)
			mapLifecycleRpcError(
				error as { code?: string; message?: string; hint?: string },
			);
		return data as Order;
	}

	async orderAction(p: OrderActionParams): Promise<Order> {
		const { data, error } = await supabase.rpc("rpc_order_action", {
			p_order_id: p.orderId,
			p_actor_id: p.actorId,
			p_actor_role: p.actorRole ?? "technician",
			p_action: p.action,
			p_reason: p.reason ?? null,
		});
		if (error)
			mapLifecycleRpcError(
				error as { code?: string; message?: string; hint?: string },
			);
		return data as Order;
	}

	async upsertLocation(p: UpsertLocationParams): Promise<OrderLocation> {
		const { data, error } = await supabase.rpc("rpc_upsert_order_location", {
			p_order_id: p.orderId,
			p_technician_id: p.technicianId,
			p_latitude: p.latitude,
			p_longitude: p.longitude,
			p_heading: p.heading ?? null,
			p_accuracy: p.accuracy ?? null,
		});
		if (error)
			mapLifecycleRpcError(
				error as { code?: string; message?: string; hint?: string },
			);
		return data as OrderLocation;
	}

	async submitQuote(p: SubmitQuoteParams): Promise<OrderQuote> {
		const { data, error } = await supabase.rpc("rpc_submit_quote", {
			p_order_id: p.orderId,
			p_actor_id: p.actorId,
			p_actor_role: p.actorRole,
			p_amount: p.amount,
			p_notes: p.notes ?? null,
		});
		if (error)
			mapLifecycleRpcError(
				error as { code?: string; message?: string; hint?: string },
			);
		return data as OrderQuote;
	}

	async acceptQuote(p: AcceptQuoteParams): Promise<Order> {
		const { data, error } = await supabase.rpc("rpc_accept_quote", {
			p_quote_id: p.quoteId,
			p_actor_id: p.actorId,
			p_actor_role: p.actorRole,
		});
		if (error)
			mapLifecycleRpcError(
				error as { code?: string; message?: string; hint?: string },
			);
		return data as Order;
	}

	async confirmCompletion(p: ConfirmCompletionParams): Promise<Order> {
		const { data, error } = await supabase.rpc("rpc_confirm_completion", {
			p_order_id: p.orderId,
			p_actor_id: p.actorId,
			p_actor_role: p.actorRole,
		});
		if (error)
			mapLifecycleRpcError(
				error as { code?: string; message?: string; hint?: string },
			);
		return data as Order;
	}

	async declineCompletion(p: ConfirmCompletionParams): Promise<Order> {
		const { data, error } = await supabase.rpc("rpc_decline_completion", {
			p_order_id: p.orderId,
			p_actor_id: p.actorId,
			p_actor_role: p.actorRole,
		});
		if (error)
			mapLifecycleRpcError(
				error as { code?: string; message?: string; hint?: string },
			);
		return data as Order;
	}

	async choosePaymentMethod(p: ChoosePaymentMethodParams): Promise<Order> {
		const { data, error } = await supabase.rpc("rpc_choose_payment_method", {
			p_order_id: p.orderId,
			p_user_id: p.userId,
			p_method: p.method,
		});
		if (error)
			mapLifecycleRpcError(
				error as { code?: string; message?: string; hint?: string },
			);
		return data as Order;
	}

	async markCashReceived(p: MarkCashReceivedParams): Promise<Order> {
		const { data, error } = await supabase.rpc("rpc_mark_cash_received", {
			p_order_id: p.orderId,
			p_tech_id: p.technicianId,
		});
		if (error)
			mapLifecycleRpcError(
				error as { code?: string; message?: string; hint?: string },
			);
		return data as Order;
	}

	async cancelOrder(p: CancelOrderParams): Promise<Order> {
		const { data, error } = await supabase.rpc("rpc_cancel_order", {
			p_order_id: p.orderId,
			p_actor_id: p.actorId,
			p_actor_role: p.actorRole,
			p_reason: p.reason ?? null,
		});
		if (error)
			mapLifecycleRpcError(
				error as { code?: string; message?: string; hint?: string },
			);
		return data as Order;
	}

	async resolveFeeObligation(
		p: ResolveFeeObligationParams,
	): Promise<UserFeeObligation> {
		const { data, error } = await supabase.rpc("rpc_resolve_fee_obligation", {
			p_obligation_id: p.obligationId,
			p_status: p.status,
		});
		if (error)
			mapLifecycleRpcError(
				error as { code?: string; message?: string; hint?: string },
			);
		return data as UserFeeObligation;
	}

	async getOrderDistance(orderId: string): Promise<number | null> {
		const { data, error } = await supabase.rpc("fn_order_distance_km", {
			p_order_id: orderId,
		});
		if (error)
			mapLifecycleRpcError(
				error as { code?: string; message?: string; hint?: string },
			);
		return (data as number | null) ?? null;
	}

	/**
	  Tag the most-recent `created` cash payment row for an order as a
	  smoke-mode auto-finalization (D10). MUST leave `provider_transaction_id`
	  NULL — setting it to any literal string would collide with the partial
	  UNIQUE index `idx_unique_provider_transaction` on the 2nd smoke run.
	 */
	async tagPaymentAsSmokeAuto(orderId: string): Promise<void> {
		const { error } = await supabase
			.from("payments")
			.update({ provider: "smoke_auto" })
			.eq("order_id", orderId)
			.eq("status", "created")
			.is("provider_transaction_id", null);
		if (error) throw error;
	}
}

export const lifecycleRepository = new LifecycleRepository();
