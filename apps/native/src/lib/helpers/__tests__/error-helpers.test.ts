import { describe, expect, it } from "vitest";
import { getErrorMessage } from "../error-helpers";

describe("getErrorMessage", () => {
	it("returns nested error.message from structured API payloads", () => {
		const error = {
			isAxiosError: true,
			response: {
				data: {
					error: {
						message: "Legacy endpoint is gone",
						code: "legacy_endpoint_gone",
					},
				},
			},
			message: "Request failed with status code 410",
		};

		expect(getErrorMessage(error)).toBe("Legacy endpoint is gone");
	});

	it("falls back to error.code when payload has no message string", () => {
		const error = {
			isAxiosError: true,
			response: {
				data: {
					error: {
						code: "cannot_submit_order_unpaid_fee",
					},
				},
			},
			message: "Request failed with status code 409",
		};

		expect(getErrorMessage(error)).toBe("cannot_submit_order_unpaid_fee");
	});
});
