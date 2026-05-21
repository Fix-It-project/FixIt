// Pure UI-state mapper for booking orders (Phase 4a D5).
//
// Translates a raw order row + viewer role into a structured `UiStateResult`
// consumed by every state-machine UI site in Phase 4b (user UI) and Phase 4c
// (tech UI). There must be no second source of truth for "what is this order's
// UI phase" — every consumer reads from this function.
//
// CONTRACT: pure function. No React, no theme imports, no Lucide imports.
// Returns plain data (`phase`, `stepIndex`, `stepCount`, `allowedActions`,
// `label`, `helperText`). UI sites resolve theme tokens and icons themselves.

import type { OrderStatus, UiPhase } from "../schemas/order-status.schema";

// --- ActionId union -----------------------------------------------------------
// Full superset of action identifiers. The mapper returns the allowed subset for
// a given (phase × viewer × status sub-state). UI sites filter further when
// they have extra context (e.g. quote round metadata, work-completion flags).
export type ActionId =
	// user actions
	| "user_cancel"
	| "user_request_reschedule"
	| "user_accept_quote"
	| "user_counter_quote"
	| "user_decline_quote"
	| "user_confirm_completion"
	| "user_confirm_paid"
	// tech actions
	| "tech_accept"
	| "tech_decline"
	| "tech_cancel"
	| "tech_start_tracking"
	| "tech_mark_arrived"
	| "tech_finish_inspection"
	| "tech_submit_quote"
	| "tech_counter_quote"
	| "tech_accept_user_quote"
	| "tech_decline_user_quote"
	| "tech_confirm_completion"
	| "tech_confirm_cash_received";

// --- Result shape -------------------------------------------------------------
export interface UiStateResult {
	phase: UiPhase;
	stepIndex: number; // 1-based for display
	stepCount: number; // total steps in this flow for the viewer
	allowedActions: readonly ActionId[];
	label: string;
	helperText: string;
}

// --- Status → phase + step index ---------------------------------------------
// `Record<OrderStatus, …>` ensures TS exhaustiveness — if any new OrderStatus
// literal is added to the schema and forgotten here, the file fails to compile.
const STATUS_TO_PHASE: Record<
	OrderStatus,
	{ phase: UiPhase; stepIndex: number }
> = {
	// Lifecycle values (Phase 1)
	pending: { phase: "waiting_to_accept", stepIndex: 1 },
	accepted: { phase: "waiting_to_accept", stepIndex: 2 },
	tracking: { phase: "tech_on_the_way", stepIndex: 3 },
	arrived_inspection: { phase: "tech_inspecting", stepIndex: 4 },
	awaiting_final_cost: { phase: "quote_open", stepIndex: 5 },
	negotiating: { phase: "quote_open", stepIndex: 5 },
	in_progress: { phase: "work_in_progress", stepIndex: 6 },
	awaiting_payment: { phase: "cash_pending", stepIndex: 6 },
	completed: { phase: "completed", stepIndex: 7 },
	declined_by_technician: { phase: "cancelled", stepIndex: 7 },
	cancelled_no_fee: { phase: "cancelled", stepIndex: 7 },
	cancelled_with_fee: { phase: "cancelled", stepIndex: 7 },
	// Legacy compat values
	rejected: { phase: "cancelled", stepIndex: 7 },
	cancelled: { phase: "cancelled", stepIndex: 7 },
	cancelled_by_user: { phase: "cancelled", stepIndex: 7 },
	cancelled_by_technician: { phase: "cancelled", stepIndex: 7 },
	reschedule_requested_by_user: { phase: "waiting_to_accept", stepIndex: 1 },
	reschedule_requested_by_technician: {
		phase: "waiting_to_accept",
		stepIndex: 1,
	},
};

// --- Phase → user-facing copy -------------------------------------------------
// `Record<UiPhase, …>` ensures TS exhaustiveness for the 7-phase set.
const PHASE_COPY: Record<UiPhase, { label: string; helperText: string }> = {
	waiting_to_accept: {
		label: "Waiting for technician",
		helperText: "We'll let you know when accepted. Up to 24 hours.",
	},
	tech_on_the_way: {
		label: "Tech on the way",
		helperText: "Heading to your address. Live ETA above.",
	},
	tech_inspecting: {
		label: "Tech inspecting",
		helperText: "Inspecting the job. Final price soon.",
	},
	quote_open: {
		label: "Quote open",
		helperText: "Review the offer. Accept, counter, or decline.",
	},
	work_in_progress: {
		label: "Work in progress",
		helperText: "Technician on the job. Confirm once the work is done.",
	},
	cash_pending: {
		label: "Awaiting payment",
		helperText: "Hand over cash and confirm.",
	},
	completed: {
		label: "Order complete",
		helperText: "Done. Thanks for using FixIt.",
	},
	cancelled: {
		label: "Order cancelled",
		helperText: "This order ended without completion.",
	},
};

// --- Allowed-action resolver --------------------------------------------------
// Branches on (phase × viewer × status sub-state). The only sub-state branch
// is in `waiting_to_accept` for viewer='technician' (different actions for
// status='pending' vs status='accepted'). Every other phase has uniform actions
// per viewer regardless of the underlying status literal.
function allowedActionsFor(
	phase: UiPhase,
	status: OrderStatus,
	viewer: "user" | "technician",
): readonly ActionId[] {
	switch (phase) {
		case "waiting_to_accept": {
			if (viewer === "user") {
				return ["user_cancel", "user_request_reschedule"] as const;
			}
			// viewer === "technician" — split on status sub-state
			// Treat reschedule-requested legacy statuses like 'pending' (action still
			// needed: accept or decline the new requested slot).
			if (
				status === "pending" ||
				status === "reschedule_requested_by_user" ||
				status === "reschedule_requested_by_technician"
			) {
				return ["tech_accept", "tech_decline"] as const;
			}
			// status === "accepted" — tech has accepted, can now start the trip or
			// cancel before tracking begins.
			return ["tech_start_tracking", "tech_cancel"] as const;
		}

		case "tech_on_the_way": {
			if (viewer === "user") return [];
			return ["tech_mark_arrived", "tech_cancel"] as const;
		}

		case "tech_inspecting": {
			if (viewer === "user") return [];
			return ["tech_finish_inspection"] as const;
		}

		case "quote_open": {
			if (viewer === "user") {
				return [
					"user_accept_quote",
					"user_counter_quote",
					"user_decline_quote",
				] as const;
			}
			// Full superset for tech — caller filters by quote round metadata.
			return [
				"tech_submit_quote",
				"tech_counter_quote",
				"tech_accept_user_quote",
				"tech_decline_user_quote",
			] as const;
		}

		case "work_in_progress": {
			if (viewer === "user") {
				return ["user_confirm_completion"] as const;
			}
			return ["tech_confirm_completion", "tech_cancel"] as const;
		}

		case "cash_pending": {
			if (viewer === "user") {
				// Caller picks between these based on completion sub-state.
				return ["user_confirm_completion", "user_confirm_paid"] as const;
			}
			return ["tech_confirm_completion", "tech_confirm_cash_received"] as const;
		}

		case "completed":
		case "cancelled":
			return [];
	}
}

// --- Total steps shown in the linear wizard ----------------------------------
const TOTAL_STEPS = 7;

// --- Public entry point -------------------------------------------------------
export function deriveUiState(
	order: { status: OrderStatus },
	viewer: "user" | "technician",
): UiStateResult {
	const { phase, stepIndex } = STATUS_TO_PHASE[order.status];
	const { label, helperText } = PHASE_COPY[phase];
	const allowedActions = allowedActionsFor(phase, order.status, viewer);
	return {
		phase,
		stepIndex,
		stepCount: TOTAL_STEPS,
		allowedActions,
		label,
		helperText,
	};
}
