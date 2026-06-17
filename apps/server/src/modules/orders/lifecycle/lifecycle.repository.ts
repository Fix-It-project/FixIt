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
	| "processing"
	| "paid"
	| "failed"
	| "cancelled";
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
	provider_order_id: string | null;
	provider_payment_id: string | null;
	provider_transaction_id: string | null;
	gross_amount: number | null;
	platform_fee_percent: number | null;
	platform_fee_amount: number | null;
	technician_net_amount: number | null;
	currency: string | null;
	provider_response: Record<string, unknown> | null;
	paid_at: string | null;
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
	paymentMethod: "cash" | "card";
	inspectionFee: number;
	inspectionDistanceKm: number;
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

export interface SwitchToCashParams {
	orderId: string;
	userId: string;
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

export interface SyncCardPaymentSnapshotParams {
	orderId: string;
	userId: string;
	provider: string;
	grossAmount: number;
	platformFeePercent: number;
	platformFeeAmount: number;
	technicianNetAmount: number;
	currency: string;
}

export interface UpdateCardPaymentStatusParams {
	paymentId: string;
	status: Extract<PaymentStatus, "processing" | "paid" | "failed" | "cancelled">;
	providerOrderId?: string | null;
	providerPaymentId?: string | null;
	providerTransactionId?: string | null;
	providerResponse?: Record<string, unknown> | null;
	paidAt?: string | null;
}

export interface PaymentProviderEventInsert {
	provider: string;
	eventId: string | null;
	payloadHash: string;
	payload: Record<string, unknown>;
	result: string;
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
// Human-readable userMessage per machine code. The `token` field on AppError
// carries the snake_case identifier for clients that need to switch on it.
const HUMAN: Record<string, string> = {
	cannot_submit_order_unpaid_fee:
		"Please clear your unpaid fees before submitting another order.",
	destination_address_not_owned_by_user:
		"That address isn't on your account.",
	service_not_offered_by_technician:
		"This technician doesn't offer that service.",
	slot_taken: "That time slot was just booked. Please pick another.",
	tech_unavailable: "The technician isn't available on that day.",
	order_not_found_or_not_owner: "Order not found.",
	order_not_found: "Order not found.",
	not_owner: "You don't have access to this order.",
	bad_actor_role: "Invalid request — unsupported role.",
	bad_payment_method: "Unsupported payment method.",
	bad_order_action: "Unsupported order action.",
	bad_status: "The order is in a state that doesn't allow this action.",
	scheduled_start_at_required: "A scheduled start time is required.",
	invalid_scheduled_start_at: "The scheduled start time is invalid.",
	scheduled_date_start_mismatch:
		"The scheduled date and start time don't match.",
	invalid_scheduled_slot: "That time slot isn't available.",
	invalid_transition: "This action isn't allowed for the current order state.",
	arrival_not_detected_yet:
		"We haven't detected your arrival at the destination yet.",
	location_updates_only_allowed_while_tracking:
		"Location updates are only allowed while tracking.",
	technician_already_has_active_order:
		"You already have an active order. Finish it before accepting another.",
	technician_already_tracking_another_order:
		"You're already tracking another order. Finish it before starting this one.",
	earlier_order_not_completed:
		"You can't start this order yet — finish your earlier order first.",
	quote_not_found: "That quote no longer exists.",
	quote_not_pending: "That quote isn't pending anymore.",
	cannot_accept_own_quote: "You can't accept your own quote.",
	cannot_cancel_from_status:
		"This order can't be cancelled from its current state.",
	wrong_actor_for_round: "It's the other party's turn to act on this quote.",
	max_quote_rounds_reached:
		"You've reached the maximum number of quote rounds.",
	missing_final_price: "A final price is required to complete this order.",
	no_cash_payment_pending: "There's no pending cash payment for this order.",
	no_completion_pending:
		"There's no pending completion request to act on.",
	fee_not_unpaid: "That fee is no longer unpaid.",
};

function humanMessageFor(code: string): string {
	return HUMAN[code] ?? "Something went wrong. Please try again.";
}

function shouldRetryLegacySubmitOrder(error: {
	code?: string;
	message?: string;
}): boolean {
	const message = error.message ?? "";
	return (
		typeof error.code === "string" &&
		error.code.startsWith("PGRST") &&
		message.includes("rpc_submit_order") &&
		(message.includes("p_inspection_fee") ||
			message.includes("p_inspection_distance_km"))
	);
}

function isRpcShapeError(error: { code?: string; message?: string }): boolean {
	const message = error.message ?? "";
	return (
		(typeof error.code === "string" && error.code.startsWith("PGRST")) ||
		message.includes("Could not find the function") ||
		message.includes("rpc_switch_to_cash")
	);
}

export function mapLifecycleRpcError(error: {
	code?: string;
	message?: string;
	hint?: string;
}): never {
	const msg = error.message ?? "";

	const conflict = (code: string): never => {
		throw AppError.conflict(humanMessageFor(code), { token: code });
	};
	const badRequest = (code: string): never => {
		throw AppError.badRequest(humanMessageFor(code), { token: code });
	};
	const notFound = (code: string): never => {
		throw AppError.notFound(humanMessageFor(code), { token: code });
	};
	const forbidden = (code: string): never => {
		throw AppError.forbidden(humanMessageFor(code), { token: code });
	};

	// Submit-time guards (most specific first — order_not_found_or_not_owner
	// must come before order_not_found / not_owner substrings).
	if (msg.includes("cannot_submit_order_unpaid_fee"))
		conflict("cannot_submit_order_unpaid_fee");
	if (msg.includes("destination_address_not_owned_by_user"))
		forbidden("destination_address_not_owned_by_user");
	if (msg.includes("service_not_offered_by_technician"))
		badRequest("service_not_offered_by_technician");
	if (msg.includes("slot_taken")) conflict("slot_taken");
	if (msg.includes("tech_unavailable")) conflict("tech_unavailable");
	if (msg.includes("order_not_found_or_not_owner"))
		notFound("order_not_found_or_not_owner");

	// Generic ownership / lookup.
	if (msg.includes("order_not_found")) notFound("order_not_found");
	if (msg.includes("not_owner")) forbidden("not_owner");

	// Bad input shapes.
	if (msg.includes("bad_actor_role")) badRequest("bad_actor_role");
	if (msg.includes("bad_payment_method")) badRequest("bad_payment_method");
	if (msg.includes("bad_order_action")) badRequest("bad_order_action");
	if (msg.includes("bad_status")) badRequest("bad_status");
	if (msg.includes("scheduled_start_at_required"))
		badRequest("scheduled_start_at_required");
	if (msg.includes("invalid_scheduled_start_at"))
		badRequest("invalid_scheduled_start_at");
	if (msg.includes("scheduled_date_start_mismatch"))
		badRequest("scheduled_date_start_mismatch");
	if (msg.includes("invalid_scheduled_slot"))
		badRequest("invalid_scheduled_slot");

	// State-machine violations.
	if (msg.includes("invalid_transition")) conflict("invalid_transition");
	if (msg.includes("arrival_not_detected_yet"))
		conflict("arrival_not_detected_yet");
	if (msg.includes("too_far_from_destination")) {
		// Surface the Postgres hint (e.g. "current distance 2.34 km") to the
		// technician in the userMessage so they understand how far off they are.
		// Keep the raw hint in opts.devMessage for logs.
		const sentence = error.hint
			? `You're too far from the destination (${error.hint}).`
			: "You're too far from the destination to start.";
		throw AppError.conflict(sentence, {
			token: "too_far_from_destination",
			devMessage: error.hint ?? undefined,
		});
	}
	if (msg.includes("location_updates_only_allowed_while_tracking"))
		conflict("location_updates_only_allowed_while_tracking");
	if (msg.includes("technician_already_has_active_order"))
		conflict("technician_already_has_active_order");
	if (msg.includes("technician_already_tracking_another_order"))
		conflict("technician_already_tracking_another_order");
	if (msg.includes("earlier_order_not_completed"))
		conflict("earlier_order_not_completed");

	// Quote-flow guards.
	if (msg.includes("quote_not_found")) notFound("quote_not_found");
	if (msg.includes("quote_not_pending")) conflict("quote_not_pending");
	if (msg.includes("cannot_accept_own_quote"))
		badRequest("cannot_accept_own_quote");
	if (msg.includes("cannot_cancel_from_status"))
		badRequest("cannot_cancel_from_status");
	if (msg.includes("wrong_actor_for_round")) badRequest("wrong_actor_for_round");
	if (msg.includes("max_quote_rounds_reached"))
		conflict("max_quote_rounds_reached");

	// Completion / payment / fees.
	if (msg.includes("missing_final_price")) conflict("missing_final_price");
	if (msg.includes("no_cash_payment_pending"))
		conflict("no_cash_payment_pending");
	if (msg.includes("no_completion_pending")) conflict("no_completion_pending");
	if (msg.includes("fee_not_unpaid")) conflict("fee_not_unpaid");

	// Unknown error — rethrow as-is (mirrors reschedule mapper's final `throw error`).
	throw error;
}

// ─── Repository ──────────────────────────────────────────────────────────────

export class LifecycleRepository {
	async submitOrder(p: SubmitOrderParams): Promise<Order> {
		const nextArgs = {
			p_user_id: p.userId,
			p_technician_id: p.technicianId,
			p_service_id: p.serviceId,
			p_destination_address_id: p.destinationAddressId,
			p_payment_method: p.paymentMethod,
			p_inspection_fee: p.inspectionFee,
			p_inspection_distance_km: p.inspectionDistanceKm,
			p_problem_description: p.problemDescription ?? null,
			p_attachment: p.attachment ?? null,
			p_scheduled_date: p.scheduledDate,
			p_scheduled_start_at: p.scheduledStartAt ?? null,
		};
		let { data, error } = await supabase.rpc("rpc_submit_order", nextArgs);
		if (
			error &&
			shouldRetryLegacySubmitOrder(
				error as { code?: string; message?: string },
			)
		) {
			({ data, error } = await supabase.rpc("rpc_submit_order", {
				p_user_id: p.userId,
				p_technician_id: p.technicianId,
				p_service_id: p.serviceId,
				p_destination_address_id: p.destinationAddressId,
				p_payment_method: p.paymentMethod,
				p_problem_description: p.problemDescription ?? null,
				p_attachment: p.attachment ?? null,
				p_scheduled_date: p.scheduledDate,
				p_scheduled_start_at: p.scheduledStartAt ?? null,
			}));
		}
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

	/** @deprecated Payment method is chosen upfront at booking; kept for back-compat. */
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

	/** @deprecated Cash auto-completes via the dual-confirm trigger now. */
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

	/** "Pay cash instead": completes a stuck awaiting_payment (card) order off-site. */
	async switchToCash(p: SwitchToCashParams): Promise<Order> {
		const { data, error } = await supabase.rpc("rpc_switch_to_cash", {
			p_order_id: p.orderId,
			p_user_id: p.userId,
		});
		if (!error) return data as Order;
		if (isRpcShapeError(error)) return this.switchToCashFallback(p);
		try {
			mapLifecycleRpcError(
				error as { code?: string; message?: string; hint?: string },
			);
		} catch (mapped) {
			if (mapped instanceof AppError) throw mapped;
			return this.switchToCashFallback(p);
		}
		return this.switchToCashFallback(p);
	}

	private async switchToCashFallback(p: SwitchToCashParams): Promise<Order> {
		const { data: order, error: readError } = await supabase
			.from("orders")
			.select("*")
			.eq("id", p.orderId)
			.eq("user_id", p.userId)
			.maybeSingle();
		if (readError) throw readError;
		if (!order) {
			throw AppError.notFound(humanMessageFor("order_not_found"), {
				token: "order_not_found",
			});
		}
		if (order.status !== "awaiting_payment") {
			throw AppError.conflict(humanMessageFor("invalid_transition"), {
				token: "invalid_transition",
			});
		}

		const amount = Number(order.final_price ?? 0);
		if (amount <= 0) {
			throw AppError.conflict(humanMessageFor("missing_final_price"), {
				token: "missing_final_price",
			});
		}

		const { error: cancelError } = await supabase
			.from("payments")
			.update({ status: "cancelled" })
			.eq("order_id", p.orderId)
			.eq("payment_method", "card")
			.in("status", ["created", "processing"]);
		if (cancelError) throw cancelError;

		const { data: paidPayment, error: paidReadError } = await supabase
			.from("payments")
			.select("id")
			.eq("order_id", p.orderId)
			.eq("status", "paid")
			.limit(1)
			.maybeSingle();
		if (paidReadError) throw paidReadError;

		if (!paidPayment) {
			const { error: paymentError } = await supabase.from("payments").insert({
				order_id: p.orderId,
				user_id: p.userId,
				amount,
				payment_method: "cash",
				status: "paid",
				provider: null,
				gross_amount: amount,
				platform_fee_percent: 0,
				platform_fee_amount: 0,
				technician_net_amount: amount,
				currency: "EGP",
				paid_at: new Date().toISOString(),
			});
			if (paymentError) throw paymentError;
		}

		const { data: completed, error: updateError } = await supabase
			.from("orders")
			.update({ status: "completed", active: false, payment_method: "cash" })
			.eq("id", p.orderId)
			.eq("user_id", p.userId)
			.eq("status", "awaiting_payment")
			.select()
			.single();
		if (updateError) throw updateError;
		return completed as Order;
	}

	async getLatestPaymentForOrder(orderId: string): Promise<Payment | null> {
		const { data, error } = await supabase
			.from("payments")
			.select(
				"id, order_id, user_id, amount, payment_method, status, provider, provider_order_id, provider_payment_id, provider_transaction_id, gross_amount, platform_fee_percent, platform_fee_amount, technician_net_amount, currency, provider_response, paid_at, created_at",
			)
			.eq("order_id", orderId)
			.order("created_at", { ascending: false })
			.limit(1)
			.maybeSingle();
		if (error) throw error;
		if (!data) return null;
		return {
			id: data.id,
			order_id: data.order_id,
			user_id: data.user_id,
			amount: Number(data.amount),
			method: data.payment_method as PaymentMethod,
			status: data.status as PaymentStatus,
			provider: data.provider,
			provider_order_id: data.provider_order_id ?? null,
			provider_payment_id: data.provider_payment_id ?? null,
			provider_transaction_id: data.provider_transaction_id ?? null,
			gross_amount:
				data.gross_amount == null ? null : Number(data.gross_amount),
			platform_fee_percent:
				data.platform_fee_percent == null
					? null
					: Number(data.platform_fee_percent),
			platform_fee_amount:
				data.platform_fee_amount == null
					? null
					: Number(data.platform_fee_amount),
			technician_net_amount:
				data.technician_net_amount == null
					? null
					: Number(data.technician_net_amount),
			currency: data.currency ?? null,
			provider_response:
				(data.provider_response as Record<string, unknown> | null) ?? null,
			paid_at: data.paid_at ?? null,
			created_at: data.created_at,
		};
	}

	async syncCardPaymentSnapshot(
		p: SyncCardPaymentSnapshotParams,
	): Promise<Payment> {
		const payment = await this.getLatestPaymentForOrder(p.orderId);
		const write = payment
			? supabase
					.from("payments")
					.update({
						status: "processing",
						provider: p.provider,
						gross_amount: p.grossAmount,
						platform_fee_percent: p.platformFeePercent,
						platform_fee_amount: p.platformFeeAmount,
						technician_net_amount: p.technicianNetAmount,
						currency: p.currency,
					})
					.eq("id", payment.id)
			: supabase.from("payments").insert({
					order_id: p.orderId,
					user_id: p.userId,
					amount: p.grossAmount,
					payment_method: "card",
					status: "processing",
					provider: p.provider,
					gross_amount: p.grossAmount,
					platform_fee_percent: p.platformFeePercent,
					platform_fee_amount: p.platformFeeAmount,
					technician_net_amount: p.technicianNetAmount,
					currency: p.currency,
				});
		const { data, error } = await write
			.select(
				"id, order_id, user_id, amount, payment_method, status, provider, provider_order_id, provider_payment_id, provider_transaction_id, gross_amount, platform_fee_percent, platform_fee_amount, technician_net_amount, currency, provider_response, paid_at, created_at",
			)
			.single();
		if (error) throw error;
		return {
			id: data.id,
			order_id: data.order_id,
			user_id: data.user_id,
			amount: Number(data.amount),
			method: data.payment_method as PaymentMethod,
			status: data.status as PaymentStatus,
			provider: data.provider,
			provider_order_id: data.provider_order_id ?? null,
			provider_payment_id: data.provider_payment_id ?? null,
			provider_transaction_id: data.provider_transaction_id ?? null,
			gross_amount:
				data.gross_amount == null ? null : Number(data.gross_amount),
			platform_fee_percent:
				data.platform_fee_percent == null
					? null
					: Number(data.platform_fee_percent),
			platform_fee_amount:
				data.platform_fee_amount == null
					? null
					: Number(data.platform_fee_amount),
			technician_net_amount:
				data.technician_net_amount == null
					? null
					: Number(data.technician_net_amount),
			currency: data.currency ?? null,
			provider_response:
				(data.provider_response as Record<string, unknown> | null) ?? null,
			paid_at: data.paid_at ?? null,
			created_at: data.created_at,
		};
	}

	async updateCardPaymentStatus(p: UpdateCardPaymentStatusParams): Promise<Payment> {
		const { data, error } = await supabase
			.from("payments")
			.update({
				status: p.status,
				provider_order_id: p.providerOrderId ?? null,
				provider_payment_id: p.providerPaymentId ?? null,
				provider_transaction_id: p.providerTransactionId ?? null,
				provider_response: p.providerResponse ?? null,
				paid_at: p.paidAt ?? null,
			})
			.eq("id", p.paymentId)
			.select(
				"id, order_id, user_id, amount, payment_method, status, provider, provider_order_id, provider_payment_id, provider_transaction_id, gross_amount, platform_fee_percent, platform_fee_amount, technician_net_amount, currency, provider_response, paid_at, created_at",
			)
			.single();
		if (error) throw error;
		return {
			id: data.id,
			order_id: data.order_id,
			user_id: data.user_id,
			amount: Number(data.amount),
			method: data.payment_method as PaymentMethod,
			status: data.status as PaymentStatus,
			provider: data.provider,
			provider_order_id: data.provider_order_id ?? null,
			provider_payment_id: data.provider_payment_id ?? null,
			provider_transaction_id: data.provider_transaction_id ?? null,
			gross_amount:
				data.gross_amount == null ? null : Number(data.gross_amount),
			platform_fee_percent:
				data.platform_fee_percent == null
					? null
					: Number(data.platform_fee_percent),
			platform_fee_amount:
				data.platform_fee_amount == null
					? null
					: Number(data.platform_fee_amount),
			technician_net_amount:
				data.technician_net_amount == null
					? null
					: Number(data.technician_net_amount),
			currency: data.currency ?? null,
			provider_response:
				(data.provider_response as Record<string, unknown> | null) ?? null,
			paid_at: data.paid_at ?? null,
			created_at: data.created_at,
		};
	}

	async markOrderCompletedAfterCardPayment(orderId: string): Promise<Order> {
		const { data, error } = await supabase
			.from("orders")
			.update({ status: "completed", active: false })
			.eq("id", orderId)
			.eq("status", "awaiting_payment")
			.select()
			.single();
		if (error) throw error;
		return data as Order;
	}

	async insertPaymentProviderEvent(
		event: PaymentProviderEventInsert,
	): Promise<void> {
		const { error } = await supabase.from("payment_provider_events").insert({
			provider: event.provider,
			external_event_id: event.eventId,
			payload_hash: event.payloadHash,
			payload: event.payload,
			received_at: new Date().toISOString(),
			result: event.result,
		});
		if (error) throw error;
	}

	async getProcessedProviderEventByHash(
		provider: string,
		payloadHash: string,
	): Promise<boolean> {
		const { data, error } = await supabase
			.from("payment_provider_events")
			.select("id")
			.eq("provider", provider)
			.eq("payload_hash", payloadHash)
			.limit(1)
			.maybeSingle();
		if (error) throw error;
		return Boolean(data);
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
