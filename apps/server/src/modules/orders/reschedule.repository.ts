import { supabaseAdmin } from "../../shared/db/supabase.js";
import { AppError } from "../../shared/errors/index.js";
import { logger } from "../../shared/logger.js";

const supabase = supabaseAdmin;

export type RescheduleResolution =
	| "pending"
	| "approved"
	| "rejected"
	| "withdrawn";

export interface RescheduleRequest {
	id: string;
	order_id: string;
	requested_by: "user" | "technician";
	original_scheduled_date: string;
	original_scheduled_start_at?: string | null;
	proposed_scheduled_date: string;
	proposed_scheduled_start_at?: string | null;
	request_reason: string;
	reject_reason: string | null;
	resolution: RescheduleResolution;
	response_window_hours: number;
	created_at: string;
	resolved_at: string | null;
}

export interface CreateRequestParams {
	orderId: string;
	actor: "user" | "technician";
	actorId: string;
	proposedDate: string;
	proposedStartAt: string;
	reason: string;
}

export interface ApproveParams {
	orderId: string;
	actor: "user" | "technician";
	actorId: string;
}

export interface RejectParams {
	orderId: string;
	actor: "user" | "technician";
	actorId: string;
	reason: string;
}

export interface WithdrawParams {
	orderId: string;
	actor: "user" | "technician";
	actorId: string;
}

/**
 * Map a Supabase RPC error → AppError. Centralises the structured-error contract
 * documented in REQUIREMENTS.md API-13. The Postgres functions in reschedule-schema.sql
 * raise these as `RAISE EXCEPTION '<code>'` which Supabase surfaces in `error.message`.
 */
type RescheduleErrorKind = "conflict" | "forbidden" | "badRequest" | "notFound";

// Ordered to mirror the original if-ladder so the first matching substring wins.
const RESCHEDULE_ERROR_RULES: ReadonlyArray<
	readonly [string, RescheduleErrorKind]
> = [
	["not_counterparty", "forbidden"],
	["not_initiator", "forbidden"],
	["forbidden_not_order_owner", "forbidden"],
	["invalid_actor", "badRequest"],
	["order_not_in_accepted_state", "badRequest"],
	["order_status_inconsistent", "conflict"],
	["order_status_changed_concurrently", "conflict"],
	["reschedule_resolution_changed_concurrently", "conflict"],
	["reschedule_already_resolved", "conflict"],
	["reschedule_not_found", "notFound"],
	["order_not_found", "notFound"],
	["proposed_not_after_original", "badRequest"],
	["proposed_not_in_future", "badRequest"],
	["proposed_scheduled_start_at_required", "badRequest"],
	["invalid_proposed_scheduled_start_at", "badRequest"],
	["invalid_proposed_scheduled_slot", "badRequest"],
	["proposed_scheduled_date_start_mismatch", "badRequest"],
	["tech_unavailable", "badRequest"],
	["cap_exhausted_for_date", "conflict"],
	["request_expired", "conflict"],
	["reason_required", "badRequest"],
	["reason_too_long", "badRequest"],
];

function throwRescheduleError(kind: RescheduleErrorKind, token: string): never {
	switch (kind) {
		case "conflict":
			throw AppError.conflict(token);
		case "forbidden":
			throw AppError.forbidden(token);
		case "badRequest":
			throw AppError.badRequest(token);
		case "notFound":
			throw AppError.notFound(token);
	}
}

function mapRpcError(error: { code?: string; message?: string }): never {
	if (error.code === "23505") {
		throw AppError.conflict("reschedule_already_pending");
	}

	const msg = error.message ?? "";

	for (const [needle, kind] of RESCHEDULE_ERROR_RULES) {
		if (msg.includes(needle)) throwRescheduleError(kind, needle);
	}

	logger.error(
		{ code: error.code, message: error.message },
		"reschedule_rpc_failed",
	);
	throw AppError.internal(
		`reschedule_rpc_failed: ${msg || "unknown_rpc_error"}`,
	);
}

export class RescheduleRepository {
	async createRequest(p: CreateRequestParams): Promise<RescheduleRequest> {
		const { data, error } = await supabase.rpc("reschedule_create", {
			p_order_id: p.orderId,
			p_actor: p.actor,
			p_actor_id: p.actorId,
			p_proposed_date: p.proposedDate,
			p_proposed_start_at: p.proposedStartAt,
			p_reason: p.reason,
		});
		if (error) mapRpcError(error as { code?: string; message?: string });
		return data as RescheduleRequest;
	}

	async approve(p: ApproveParams): Promise<RescheduleRequest> {
		const { data, error } = await supabase.rpc("reschedule_approve", {
			p_order_id: p.orderId,
			p_actor: p.actor,
			p_actor_id: p.actorId,
		});
		if (error) mapRpcError(error as { code?: string; message?: string });
		return data as RescheduleRequest;
	}

	async reject(p: RejectParams): Promise<RescheduleRequest> {
		const { data, error } = await supabase.rpc("reschedule_reject", {
			p_order_id: p.orderId,
			p_actor: p.actor,
			p_actor_id: p.actorId,
			p_reason: p.reason,
		});
		if (error) mapRpcError(error as { code?: string; message?: string });
		return data as RescheduleRequest;
	}

	async withdraw(p: WithdrawParams): Promise<RescheduleRequest> {
		const { data, error } = await supabase.rpc("reschedule_withdraw", {
			p_order_id: p.orderId,
			p_actor: p.actor,
			p_actor_id: p.actorId,
		});
		if (error) mapRpcError(error as { code?: string; message?: string });
		return data as RescheduleRequest;
	}

	async autoRejectIfExpired(
		orderId: string,
	): Promise<RescheduleRequest | null> {
		const { data, error } = await supabase.rpc("auto_reject_if_expired", {
			p_order_id: orderId,
		});
		if (error) mapRpcError(error as { code?: string; message?: string });
		return (data ?? null) as RescheduleRequest | null;
	}

	/** Most-recent reschedule row for an order (any resolution), or null. */
	async getByOrderId(orderId: string): Promise<RescheduleRequest | null> {
		const { data, error } = await supabase
			.from("reschedule_requests")
			.select("*")
			.eq("order_id", orderId)
			.order("created_at", { ascending: false })
			.limit(1)
			.maybeSingle();
		if (error) throw error;
		return (data ?? null) as RescheduleRequest | null;
	}

	/** Active (pending) reschedule row for an order, or null. */
	async getPendingByOrderId(
		orderId: string,
	): Promise<RescheduleRequest | null> {
		const { data, error } = await supabase
			.from("reschedule_requests")
			.select("*")
			.eq("order_id", orderId)
			.eq("resolution", "pending")
			.maybeSingle();
		if (error) throw error;
		return (data ?? null) as RescheduleRequest | null;
	}

	/**
	 * Called from OrdersService cancel paths. Routes through the reject RPC with
	 * p_actor='system' to keep atomicity on the order/request flip.
	 * Returns null when there was nothing to cancel.
	 */
	async cancelPendingForOrder(
		orderId: string,
		reason: string,
	): Promise<RescheduleRequest | null> {
		const pending = await this.getPendingByOrderId(orderId);
		if (!pending) return null;

		const { data, error } = await supabase.rpc("reschedule_reject", {
			p_order_id: orderId,
			p_actor: "system",
			p_actor_id: null,
			p_reason: reason,
		});
		if (error) mapRpcError(error as { code?: string; message?: string });
		return data as RescheduleRequest;
	}
}

export const rescheduleRepository = new RescheduleRepository();
