import { describe, expect, it } from "vitest";
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
});
