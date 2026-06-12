import { describe, expect, it, vi } from "vitest";

vi.mock("@/src/lib/errors", () => ({
	getErrorMessage: vi.fn(() => "fallback message"),
}));

import {
	extractOrderErrorToken,
	translateOrderError,
} from "../translate-order-error";

describe("translateOrderError", () => {
	it("translates cannot_submit_order_unpaid_fee into a user-facing message", () => {
		const error = {
			response: {
				data: {
					error: "cannot_submit_order_unpaid_fee",
				},
			},
		};

		expect(translateOrderError(error)).toBe(
			"Your account has an unpaid inspection cancellation fee. Clear or waive it before placing a new order.",
		);
		expect(extractOrderErrorToken(error)).toBe(
			"cannot_submit_order_unpaid_fee",
		);
	});

	it("reads structured error objects that use error.code", () => {
		const error = {
			response: {
				data: {
					error: {
						code: "tech_unavailable",
					},
				},
			},
		};

		expect(translateOrderError(error)).toBe(
			"The technician isn't available on that date.",
		);
		expect(extractOrderErrorToken(error)).toBe("tech_unavailable");
	});

	it("falls back to the raw token when no translation exists", () => {
		const error = {
			response: {
				data: {
					error: "some_future_token",
				},
			},
		};

		expect(translateOrderError(error)).toBe("some_future_token");
	});

	it("translates inspection_fee_pricing_unavailable into a booking-safe message", () => {
		const error = {
			response: {
				data: {
					error: "inspection_fee_pricing_unavailable",
				},
			},
		};

		expect(translateOrderError(error)).toBe(
			"We couldn't calculate the inspection fee for this booking. Please update the saved locations and try again.",
		);
	});
});
