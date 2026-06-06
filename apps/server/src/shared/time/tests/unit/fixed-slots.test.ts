import { describe, expect, it } from "vitest";
import { AppError } from "../../../errors/index.js";
import { assertFixedSlotStartAtInCairo } from "../../fixed-slots.js";

function capture(fn: () => void): unknown {
	try {
		fn();
		return null;
	} catch (error) {
		return error;
	}
}

describe("assertFixedSlotStartAtInCairo", () => {
	const baseArgs = {
		dateYmd: "2026-06-01",
		requiredCode: "required_code",
		invalidDatetimeCode: "invalid_datetime_code",
		invalidSlotCode: "invalid_slot_code",
		dateMismatchCode: "date_mismatch_code",
	};

	it("passes when start is on a fixed Cairo slot", () => {
		expect(() =>
			assertFixedSlotStartAtInCairo({
				...baseArgs,
				startAt: "2026-06-01T11:00:00+03:00",
			}),
		).not.toThrow();
	});

	it("throws requiredCode when start is missing", () => {
		const caught = capture(() =>
			assertFixedSlotStartAtInCairo({
				...baseArgs,
				startAt: null,
			}),
		);
		expect(caught).toBeInstanceOf(AppError);
		expect((caught as AppError).message).toContain("required_code");
	});

	it("throws dateMismatchCode when Cairo day differs from dateYmd", () => {
		const caught = capture(() =>
			assertFixedSlotStartAtInCairo({
				...baseArgs,
				startAt: "2026-06-01T22:00:00Z",
			}),
		);
		expect(caught).toBeInstanceOf(AppError);
		expect((caught as AppError).message).toContain("date_mismatch_code");
	});

	it("throws invalidSlotCode when not on fixed hour", () => {
		const caught = capture(() =>
			assertFixedSlotStartAtInCairo({
				...baseArgs,
				startAt: "2026-06-01T09:00:00+03:00",
			}),
		);
		expect(caught).toBeInstanceOf(AppError);
		expect((caught as AppError).message).toContain("invalid_slot_code");
	});
});
