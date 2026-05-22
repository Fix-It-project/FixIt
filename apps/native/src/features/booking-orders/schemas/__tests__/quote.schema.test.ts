import { describe, expect, test } from "vitest";
import {
	orderQuoteResponseSchema,
	orderQuoteSchema,
	orderQuotesResponseSchema,
	quoteRoundStatusSchema,
} from "../quote.schema";

const VALID_UUID_A = "550e8400-e29b-41d4-a716-446655440000";
const VALID_UUID_B = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const VALID_UUID_C = "6ba7b811-9dad-11d1-80b4-00c04fd430c8";

const baseQuote = {
	id: VALID_UUID_A,
	order_id: VALID_UUID_B,
	round_number: 1,
	proposed_by: "technician" as const,
	proposer_id: VALID_UUID_C,
	amount: 500,
	notes: "Initial estimate",
	status: "pending" as const,
	created_at: "2026-05-16T10:00:00.000Z",
	resolved_at: null,
};

describe("quoteRoundStatusSchema", () => {
	test.each([
		"pending",
		"accepted",
		"rejected",
		"superseded",
	])("accepts %s", (value) => {
		expect(quoteRoundStatusSchema.safeParse(value).success).toBe(true);
	});

	test("rejects unknown status", () => {
		expect(quoteRoundStatusSchema.safeParse("expired").success).toBe(false);
	});
});

describe("orderQuoteSchema", () => {
	describe("valid inputs", () => {
		test("parses canonical happy-path quote", () => {
			const result = orderQuoteSchema.safeParse(baseQuote);
			expect(result.success).toBe(true);
		});

		test("accepts null notes", () => {
			const result = orderQuoteSchema.safeParse({
				...baseQuote,
				notes: null,
			});
			expect(result.success).toBe(true);
		});

		test("accepts non-null resolved_at", () => {
			const result = orderQuoteSchema.safeParse({
				...baseQuote,
				status: "accepted",
				resolved_at: "2026-05-16T11:00:00.000Z",
			});
			expect(result.success).toBe(true);
		});

		test("accepts proposed_by = user", () => {
			const result = orderQuoteSchema.safeParse({
				...baseQuote,
				proposed_by: "user",
			});
			expect(result.success).toBe(true);
		});

		test.each([1, 2, 3, 4, 5])("accepts round_number = %i", (round) => {
			const result = orderQuoteSchema.safeParse({
				...baseQuote,
				round_number: round,
			});
			expect(result.success).toBe(true);
		});

		test("accepts amount = 0 (free)", () => {
			const result = orderQuoteSchema.safeParse({ ...baseQuote, amount: 0 });
			expect(result.success).toBe(true);
		});
	});

	describe("invalid inputs", () => {
		test("rejects round_number = 0", () => {
			expect(
				orderQuoteSchema.safeParse({ ...baseQuote, round_number: 0 }).success,
			).toBe(false);
		});

		test("rejects round_number = 6 (5-round cap)", () => {
			expect(
				orderQuoteSchema.safeParse({ ...baseQuote, round_number: 6 }).success,
			).toBe(false);
		});

		test("rejects non-integer round_number", () => {
			expect(
				orderQuoteSchema.safeParse({ ...baseQuote, round_number: 1.5 }).success,
			).toBe(false);
		});

		test("rejects negative amount", () => {
			expect(
				orderQuoteSchema.safeParse({ ...baseQuote, amount: -1 }).success,
			).toBe(false);
		});

		test("rejects non-integer amount", () => {
			expect(
				orderQuoteSchema.safeParse({ ...baseQuote, amount: 99.5 }).success,
			).toBe(false);
		});

		test("rejects invalid UUID for id", () => {
			expect(
				orderQuoteSchema.safeParse({ ...baseQuote, id: "not-a-uuid" }).success,
			).toBe(false);
		});

		test("rejects invalid UUID for order_id", () => {
			expect(
				orderQuoteSchema.safeParse({ ...baseQuote, order_id: "x" }).success,
			).toBe(false);
		});

		test("rejects invalid UUID for proposer_id", () => {
			expect(
				orderQuoteSchema.safeParse({ ...baseQuote, proposer_id: "x" }).success,
			).toBe(false);
		});

		test("rejects unknown proposed_by value", () => {
			expect(
				orderQuoteSchema.safeParse({ ...baseQuote, proposed_by: "admin" })
					.success,
			).toBe(false);
		});

		test("rejects unknown status", () => {
			expect(
				orderQuoteSchema.safeParse({ ...baseQuote, status: "expired" }).success,
			).toBe(false);
		});

		test("rejects missing required field (id)", () => {
			const { id: _id, ...withoutId } = baseQuote;
			expect(orderQuoteSchema.safeParse(withoutId).success).toBe(false);
		});

		test("rejects notes as undefined (must be string or null, not omitted)", () => {
			const { notes: _notes, ...withoutNotes } = baseQuote;
			expect(orderQuoteSchema.safeParse(withoutNotes).success).toBe(false);
		});
	});
});

describe("orderQuoteResponseSchema", () => {
	test("wraps a quote in { data }", () => {
		const result = orderQuoteResponseSchema.safeParse({ data: baseQuote });
		expect(result.success).toBe(true);
	});

	test("rejects missing data field", () => {
		expect(orderQuoteResponseSchema.safeParse({}).success).toBe(false);
	});
});

describe("orderQuotesResponseSchema", () => {
	test("parses empty list", () => {
		const result = orderQuotesResponseSchema.safeParse({ data: [] });
		expect(result.success).toBe(true);
	});

	test("parses list with multiple quotes", () => {
		const result = orderQuotesResponseSchema.safeParse({
			data: [baseQuote, { ...baseQuote, round_number: 2 }],
		});
		expect(result.success).toBe(true);
	});

	test("rejects when one element is malformed", () => {
		const result = orderQuotesResponseSchema.safeParse({
			data: [baseQuote, { ...baseQuote, round_number: 9 }],
		});
		expect(result.success).toBe(false);
	});
});
