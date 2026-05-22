import { describe, expect, test } from "vitest";
import type { OrderStatus, UiPhase } from "../../schemas/order-status.schema";
import { type ActionId, deriveUiState } from "../derive-ui-state";

// ---------------------------------------------------------------------------
// Expected mapping table — one row per (status × viewer). 18 statuses × 2
// viewers = 36 rows. Every assertion below references this table so we can be
// sure we exercised every combination.
// ---------------------------------------------------------------------------

interface Expected {
	phase: UiPhase;
	stepIndex: number;
	userActions: readonly ActionId[];
	techActions: readonly ActionId[];
}

const EXPECTED: Record<OrderStatus, Expected> = {
	// --- Lifecycle (Phase 1) -------------------------------------------------
	pending: {
		phase: "waiting_to_accept",
		stepIndex: 1,
		userActions: ["user_cancel", "user_request_reschedule"],
		techActions: ["tech_accept", "tech_decline"],
	},
	accepted: {
		phase: "waiting_to_accept",
		stepIndex: 2,
		userActions: ["user_cancel", "user_request_reschedule"],
		techActions: ["tech_start_tracking", "tech_cancel"],
	},
	tracking: {
		phase: "tech_on_the_way",
		stepIndex: 3,
		userActions: [],
		techActions: ["tech_mark_arrived", "tech_cancel"],
	},
	arrived_inspection: {
		phase: "tech_inspecting",
		stepIndex: 4,
		userActions: [],
		techActions: ["tech_finish_inspection"],
	},
	awaiting_final_cost: {
		phase: "quote_open",
		stepIndex: 5,
		userActions: [
			"user_accept_quote",
			"user_counter_quote",
			"user_decline_quote",
		],
		techActions: [
			"tech_submit_quote",
			"tech_counter_quote",
			"tech_accept_user_quote",
			"tech_decline_user_quote",
		],
	},
	negotiating: {
		phase: "quote_open",
		stepIndex: 5,
		userActions: [
			"user_accept_quote",
			"user_counter_quote",
			"user_decline_quote",
		],
		techActions: [
			"tech_submit_quote",
			"tech_counter_quote",
			"tech_accept_user_quote",
			"tech_decline_user_quote",
		],
	},
	in_progress: {
		phase: "work_in_progress",
		stepIndex: 6,
		userActions: ["user_confirm_completion"],
		techActions: ["tech_confirm_completion", "tech_cancel"],
	},
	awaiting_payment: {
		phase: "cash_pending",
		stepIndex: 6,
		userActions: ["user_confirm_completion", "user_confirm_paid"],
		techActions: ["tech_confirm_completion", "tech_confirm_cash_received"],
	},
	completed: {
		phase: "completed",
		stepIndex: 7,
		userActions: [],
		techActions: [],
	},
	declined_by_technician: {
		phase: "cancelled",
		stepIndex: 7,
		userActions: [],
		techActions: [],
	},
	cancelled_no_fee: {
		phase: "cancelled",
		stepIndex: 7,
		userActions: [],
		techActions: [],
	},
	cancelled_with_fee: {
		phase: "cancelled",
		stepIndex: 7,
		userActions: [],
		techActions: [],
	},
	// --- Legacy compat -------------------------------------------------------
	rejected: {
		phase: "cancelled",
		stepIndex: 7,
		userActions: [],
		techActions: [],
	},
	cancelled: {
		phase: "cancelled",
		stepIndex: 7,
		userActions: [],
		techActions: [],
	},
	cancelled_by_user: {
		phase: "cancelled",
		stepIndex: 7,
		userActions: [],
		techActions: [],
	},
	cancelled_by_technician: {
		phase: "cancelled",
		stepIndex: 7,
		userActions: [],
		techActions: [],
	},
	reschedule_requested_by_user: {
		phase: "waiting_to_accept",
		stepIndex: 1,
		userActions: ["user_cancel", "user_request_reschedule"],
		techActions: ["tech_accept", "tech_decline"],
	},
	reschedule_requested_by_technician: {
		phase: "waiting_to_accept",
		stepIndex: 1,
		userActions: ["user_cancel", "user_request_reschedule"],
		techActions: ["tech_accept", "tech_decline"],
	},
};

const ALL_STATUSES = Object.keys(EXPECTED) as OrderStatus[];

// ---------------------------------------------------------------------------
// Exhaustive table-driven suites
// ---------------------------------------------------------------------------

describe("deriveUiState — viewer=user", () => {
	test("EXPECTED table covers all 18 OrderStatus literals", () => {
		expect(ALL_STATUSES).toHaveLength(18);
	});

	test.each(ALL_STATUSES)("maps status=%s correctly for user", (status) => {
		const expected = EXPECTED[status];
		const result = deriveUiState({ status }, "user");
		expect(result.phase).toBe(expected.phase);
		expect(result.stepIndex).toBe(expected.stepIndex);
		expect(result.stepCount).toBe(7);
		expect(result.allowedActions).toEqual(expected.userActions);
		expect(result.allowedActions.length).toBe(expected.userActions.length);
	});
});

describe("deriveUiState — viewer=technician", () => {
	test.each(
		ALL_STATUSES,
	)("maps status=%s correctly for technician", (status) => {
		const expected = EXPECTED[status];
		const result = deriveUiState({ status }, "technician");
		expect(result.phase).toBe(expected.phase);
		expect(result.stepIndex).toBe(expected.stepIndex);
		expect(result.stepCount).toBe(7);
		expect(result.allowedActions).toEqual(expected.techActions);
		expect(result.allowedActions.length).toBe(expected.techActions.length);
	});
});

// ---------------------------------------------------------------------------
// Spot checks — the high-value invariants called out by the plan
// ---------------------------------------------------------------------------

describe("deriveUiState — invariants", () => {
	test("tracking + user → phase tech_on_the_way + empty actions", () => {
		const result = deriveUiState({ status: "tracking" }, "user");
		expect(result.phase).toBe("tech_on_the_way");
		expect(result.allowedActions).toEqual([]);
	});

	test("cancelled phase has empty actions for both viewers", () => {
		const cancelledStatuses: OrderStatus[] = [
			"declined_by_technician",
			"cancelled_no_fee",
			"cancelled_with_fee",
			"rejected",
			"cancelled",
			"cancelled_by_user",
			"cancelled_by_technician",
		];
		for (const status of cancelledStatuses) {
			expect(deriveUiState({ status }, "user").allowedActions).toEqual([]);
			expect(deriveUiState({ status }, "technician").allowedActions).toEqual(
				[],
			);
		}
	});

	test("completed phase has empty actions for both viewers", () => {
		expect(
			deriveUiState({ status: "completed" }, "user").allowedActions,
		).toEqual([]);
		expect(
			deriveUiState({ status: "completed" }, "technician").allowedActions,
		).toEqual([]);
	});

	test("waiting_to_accept tech actions DIFFER between status=pending and status=accepted", () => {
		const pendingTech = deriveUiState({ status: "pending" }, "technician");
		const acceptedTech = deriveUiState({ status: "accepted" }, "technician");
		expect(pendingTech.phase).toBe("waiting_to_accept");
		expect(acceptedTech.phase).toBe("waiting_to_accept");
		expect(pendingTech.allowedActions).toEqual(["tech_accept", "tech_decline"]);
		expect(acceptedTech.allowedActions).toEqual([
			"tech_start_tracking",
			"tech_cancel",
		]);
		expect(pendingTech.allowedActions).not.toEqual(acceptedTech.allowedActions);
	});

	test("waiting_to_accept user actions are uniform across pending/accepted/legacy reschedule", () => {
		const expectedUserActions: ActionId[] = [
			"user_cancel",
			"user_request_reschedule",
		];
		const statuses: OrderStatus[] = [
			"pending",
			"accepted",
			"reschedule_requested_by_user",
			"reschedule_requested_by_technician",
		];
		for (const status of statuses) {
			expect(deriveUiState({ status }, "user").allowedActions).toEqual(
				expectedUserActions,
			);
		}
	});

	test("quote_open returns full superset of quote actions per viewer", () => {
		const userQuote = deriveUiState(
			{ status: "negotiating" },
			"user",
		).allowedActions;
		const techQuote = deriveUiState(
			{ status: "negotiating" },
			"technician",
		).allowedActions;
		expect(userQuote).toContain("user_accept_quote");
		expect(userQuote).toContain("user_counter_quote");
		expect(userQuote).toContain("user_decline_quote");
		expect(techQuote).toContain("tech_submit_quote");
		expect(techQuote).toContain("tech_counter_quote");
		expect(techQuote).toContain("tech_accept_user_quote");
		expect(techQuote).toContain("tech_decline_user_quote");
	});

	test("label and helperText are the same for both viewers (per current contract)", () => {
		for (const status of ALL_STATUSES) {
			const u = deriveUiState({ status }, "user");
			const t = deriveUiState({ status }, "technician");
			expect(u.label).toBe(t.label);
			expect(u.helperText).toBe(t.helperText);
		}
	});

	test("stepCount is always 7 across all (status × viewer) combos", () => {
		for (const status of ALL_STATUSES) {
			expect(deriveUiState({ status }, "user").stepCount).toBe(7);
			expect(deriveUiState({ status }, "technician").stepCount).toBe(7);
		}
	});

	test("returned allowedActions is a readonly-friendly array", () => {
		const result = deriveUiState({ status: "pending" }, "user");
		expect(Array.isArray(result.allowedActions)).toBe(true);
		expect(result.allowedActions.length).toBe(2);
		expect(result.allowedActions[0]).toBe("user_cancel");
		expect(result.allowedActions[1]).toBe("user_request_reschedule");
	});

	test("PHASE_COPY strings are caveman-tone and stable", () => {
		expect(deriveUiState({ status: "pending" }, "user").label).toBe(
			"Waiting for technician",
		);
		expect(deriveUiState({ status: "tracking" }, "user").helperText).toBe(
			"Heading to your address. Live ETA above.",
		);
		expect(deriveUiState({ status: "completed" }, "user").label).toBe(
			"Order complete",
		);
		expect(deriveUiState({ status: "cancelled" }, "user").label).toBe(
			"Order cancelled",
		);
	});
});
