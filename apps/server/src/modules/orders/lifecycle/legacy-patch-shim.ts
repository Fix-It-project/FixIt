import { AppError } from "../../../shared/errors/index.js";

export type LegacyPatchAction =
	| { kind: "cancel"; reason: string | null }
	| { kind: "tech_accept" }
	| { kind: "tech_decline"; reason: string | null }
	| { kind: "tech_cancel"; reason: string | null }
	| { kind: "gone"; hint: string };

const GONE_HINT =
	"use POST /technician/orders/:id/finish-inspection -> /quotes -> /confirm-completion + payment flow";

// Narrow `unknown` to a record so we can read its fields safely. 
function asRecord(body: unknown): Record<string, unknown> {
	if (typeof body !== "object" || body === null) return {};
	return body as Record<string, unknown>;
}

//Pull `cancellation_reason` if it is a string; otherwise null.
function readReason(body: Record<string, unknown>): string | null {
	return typeof body.cancellation_reason === "string"
		? body.cancellation_reason
		: null;
}

// Map a legacy `PATCH /user/orders/:id` body to a lifecycle action.
export function mapUserPatchToAction(body: unknown): LegacyPatchAction {
	const b = asRecord(body);
	if (b.cancel === true) {
		return { kind: "cancel", reason: readReason(b) };
	}
	throw AppError.badRequest("invalid_legacy_patch_payload");
}


// Map a legacy `PATCH /technician/orders/:id` body to a lifecycle action.
export function mapTechnicianPatchToAction(body: unknown): LegacyPatchAction {
	const b = asRecord(body);
	const status = b.status;

	if (status === "accepted") {
		return { kind: "tech_accept" };
	}
	if (status === "rejected") {
		return { kind: "tech_decline", reason: readReason(b) };
	}
	if (status === "cancelled_by_technician") {
		return { kind: "tech_cancel", reason: readReason(b) };
	}
	if (status === "completed") {
		return { kind: "gone", hint: GONE_HINT };
	}
	if (
		status === "reschedule_requested_by_user" ||
		status === "reschedule_requested_by_technician" ||
		status === "reschedule_accepted" ||
		status === "reschedule_declined"
	) {
		throw AppError.badRequest("use_reschedule_route");
	}

	throw AppError.badRequest("invalid_legacy_patch_payload");
}
