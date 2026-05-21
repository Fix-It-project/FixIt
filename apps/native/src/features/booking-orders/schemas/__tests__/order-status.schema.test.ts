import { describe, expect, test } from "vitest";
import {
	IN_PROGRESS_STATUSES,
	orderStatusSchema,
	TERMINAL_STATUSES,
	uiPhaseSchema,
} from "../order-status.schema";

const ALL_ORDER_STATUSES = [
	// Lifecycle (12)
	"pending",
	"accepted",
	"tracking",
	"arrived_inspection",
	"awaiting_final_cost",
	"negotiating",
	"in_progress",
	"awaiting_payment",
	"completed",
	"declined_by_technician",
	"cancelled_no_fee",
	"cancelled_with_fee",
	// Legacy compat (6)
	"reschedule_requested_by_user",
	"reschedule_requested_by_technician",
	"rejected",
	"cancelled",
	"cancelled_by_user",
	"cancelled_by_technician",
] as const;

const ALL_UI_PHASES = [
	"waiting_to_accept",
	"tech_on_the_way",
	"tech_inspecting",
	"quote_open",
	"cash_pending",
	"completed",
	"cancelled",
] as const;

describe("orderStatusSchema", () => {
	describe("valid lifecycle + legacy enum values", () => {
		test.each(ALL_ORDER_STATUSES)("accepts %s", (value) => {
			const result = orderStatusSchema.safeParse(value);
			expect(result.success).toBe(true);
		});

		test("covers all 18 enum members (12 lifecycle + 6 legacy)", () => {
			expect(ALL_ORDER_STATUSES).toHaveLength(18);
			for (const value of ALL_ORDER_STATUSES) {
				expect(orderStatusSchema.safeParse(value).success).toBe(true);
			}
		});
	});

	describe("invalid inputs", () => {
		test("rejects unknown literal", () => {
			const result = orderStatusSchema.safeParse("totally_made_up");
			expect(result.success).toBe(false);
		});

		test("rejects empty string", () => {
			expect(orderStatusSchema.safeParse("").success).toBe(false);
		});

		test("rejects null", () => {
			expect(orderStatusSchema.safeParse(null).success).toBe(false);
		});

		test("rejects number", () => {
			expect(orderStatusSchema.safeParse(1).success).toBe(false);
		});

		test("rejects object", () => {
			expect(orderStatusSchema.safeParse({ status: "pending" }).success).toBe(
				false,
			);
		});
	});
});

describe("uiPhaseSchema", () => {
	describe("valid UI phases", () => {
		test.each(ALL_UI_PHASES)("accepts %s", (value) => {
			const result = uiPhaseSchema.safeParse(value);
			expect(result.success).toBe(true);
		});

		test("has exactly 7 canonical phase strings", () => {
			expect(ALL_UI_PHASES).toHaveLength(7);
		});
	});

	describe("invalid inputs", () => {
		test("rejects DB enum value not in UI phase set", () => {
			// tracking is an OrderStatus but NOT a UI phase (it maps to tech_on_the_way).
			expect(uiPhaseSchema.safeParse("tracking").success).toBe(false);
		});

		test("rejects unknown phase", () => {
			expect(uiPhaseSchema.safeParse("not_a_phase").success).toBe(false);
		});

		test("rejects null", () => {
			expect(uiPhaseSchema.safeParse(null).success).toBe(false);
		});
	});
});

describe("status set utilities", () => {
	test("IN_PROGRESS_STATUSES contains exactly the in-progress lifecycle values", () => {
		const expected = new Set([
			"tracking",
			"arrived_inspection",
			"awaiting_final_cost",
			"negotiating",
			"in_progress",
			"awaiting_payment",
		]);
		expect(IN_PROGRESS_STATUSES.size).toBe(expected.size);
		for (const value of expected) {
			expect(IN_PROGRESS_STATUSES.has(value as never)).toBe(true);
		}
	});

	test("TERMINAL_STATUSES includes completed and all cancel/reject variants", () => {
		expect(TERMINAL_STATUSES.has("completed")).toBe(true);
		expect(TERMINAL_STATUSES.has("declined_by_technician")).toBe(true);
		expect(TERMINAL_STATUSES.has("cancelled_no_fee")).toBe(true);
		expect(TERMINAL_STATUSES.has("cancelled_with_fee")).toBe(true);
		expect(TERMINAL_STATUSES.has("rejected")).toBe(true);
		expect(TERMINAL_STATUSES.has("cancelled")).toBe(true);
		expect(TERMINAL_STATUSES.has("cancelled_by_user")).toBe(true);
		expect(TERMINAL_STATUSES.has("cancelled_by_technician")).toBe(true);
	});

	test("IN_PROGRESS_STATUSES and TERMINAL_STATUSES do NOT overlap", () => {
		for (const value of IN_PROGRESS_STATUSES) {
			expect(TERMINAL_STATUSES.has(value)).toBe(false);
		}
	});

	test("pending is in neither set (it's a pre-progress state)", () => {
		expect(IN_PROGRESS_STATUSES.has("pending")).toBe(false);
		expect(TERMINAL_STATUSES.has("pending")).toBe(false);
	});
});
