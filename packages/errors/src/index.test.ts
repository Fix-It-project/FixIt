import { describe, expect, it } from "vitest";
import { AppError, isRetryable, statusFromCode } from "./index";

describe("AppError", () => {
	it("preserves the code", () => {
		const err = new AppError("VALIDATION", "fix the form");
		expect(err.code).toBe("VALIDATION");
	});

	it("uses the code as Error.message when no devMessage is provided", () => {
		const err = new AppError("VALIDATION", "fix");
		expect(err.message).toBe("VALIDATION");
	});

	it("uses opts.devMessage as Error.message when provided", () => {
		const err = new AppError("VALIDATION", "fix", {
			devMessage: "DB constraint X",
		});
		expect(err.message).toBe("DB constraint X");
	});

	it("NEVER leaks userMessage into Error.message (Sentry grouping stability, D-02)", () => {
		// Localized non-ASCII userMessage MUST NOT show up in Error.message —
		// otherwise Sentry groups by locale-fragmented user copy.
		const userMessage = "loca lized يا حبيبي";
		const err = new AppError("VALIDATION", userMessage);
		expect(err.message).not.toBe(userMessage);
	});

	it("sets name = 'AppError'", () => {
		const err = new AppError("NETWORK", "");
		expect(err.name).toBe("AppError");
	});

	it("preserves userMessage on the instance (UI may read it)", () => {
		const err = new AppError("VALIDATION", "Please check the form");
		expect(err.userMessage).toBe("Please check the form");
	});

	it("preserves opts.cause when supplied (ES2022 cause)", () => {
		const root = new Error("root");
		const err = new AppError("SERVER", "", { cause: root });
		expect((err as unknown as { cause?: unknown }).cause).toBe(root);
	});

	it("is an instance of Error", () => {
		const err = new AppError("UNKNOWN", "");
		expect(err).toBeInstanceOf(Error);
	});
});

describe("isRetryable", () => {
	it("returns true for NETWORK by default", () => {
		expect(isRetryable(new AppError("NETWORK", ""))).toBe(true);
	});

	it("returns true for TIMEOUT by default", () => {
		expect(isRetryable(new AppError("TIMEOUT", ""))).toBe(true);
	});

	it("returns true for RATE_LIMITED by default", () => {
		expect(isRetryable(new AppError("RATE_LIMITED", ""))).toBe(true);
	});

	it("returns true for SERVER by default", () => {
		expect(isRetryable(new AppError("SERVER", ""))).toBe(true);
	});

	it("returns false for VALIDATION by default", () => {
		expect(isRetryable(new AppError("VALIDATION", ""))).toBe(false);
	});

	it("returns false for UNAUTHENTICATED by default", () => {
		expect(isRetryable(new AppError("UNAUTHENTICATED", ""))).toBe(false);
	});

	it("returns false for FORBIDDEN by default", () => {
		expect(isRetryable(new AppError("FORBIDDEN", ""))).toBe(false);
	});

	it("returns false for NOT_FOUND by default", () => {
		expect(isRetryable(new AppError("NOT_FOUND", ""))).toBe(false);
	});

	it("returns false for CONFLICT by default", () => {
		expect(isRetryable(new AppError("CONFLICT", ""))).toBe(false);
	});

	it("returns false for OFFLINE by default", () => {
		expect(isRetryable(new AppError("OFFLINE", ""))).toBe(false);
	});

	it("returns false for UNKNOWN by default", () => {
		expect(isRetryable(new AppError("UNKNOWN", ""))).toBe(false);
	});

	it("opts.retryable=true overrides a non-retryable default", () => {
		expect(
			isRetryable(new AppError("VALIDATION", "", { retryable: true })),
		).toBe(true);
	});

	it("opts.retryable=false overrides a retryable default", () => {
		expect(
			isRetryable(new AppError("NETWORK", "", { retryable: false })),
		).toBe(false);
	});
});

describe("statusFromCode", () => {
	it("maps UNAUTHENTICATED → 401", () => {
		expect(statusFromCode("UNAUTHENTICATED")).toBe(401);
	});

	it("maps FORBIDDEN → 403", () => {
		expect(statusFromCode("FORBIDDEN")).toBe(403);
	});

	it("maps NOT_FOUND → 404", () => {
		expect(statusFromCode("NOT_FOUND")).toBe(404);
	});

	it("maps CONFLICT → 409", () => {
		expect(statusFromCode("CONFLICT")).toBe(409);
	});

	it("maps VALIDATION → 422", () => {
		expect(statusFromCode("VALIDATION")).toBe(422);
	});

	it("maps RATE_LIMITED → 429", () => {
		expect(statusFromCode("RATE_LIMITED")).toBe(429);
	});

	it("maps MAINTENANCE → 503", () => {
		expect(statusFromCode("MAINTENANCE")).toBe(503);
	});

	it("maps SERVER → 500", () => {
		expect(statusFromCode("SERVER")).toBe(500);
	});

	it("maps NETWORK → 500 (no canonical HTTP)", () => {
		expect(statusFromCode("NETWORK")).toBe(500);
	});

	it("maps TIMEOUT → 500 (no canonical HTTP)", () => {
		expect(statusFromCode("TIMEOUT")).toBe(500);
	});

	it("maps OFFLINE → 500 (no canonical HTTP)", () => {
		expect(statusFromCode("OFFLINE")).toBe(500);
	});

	it("maps UNKNOWN → 500", () => {
		expect(statusFromCode("UNKNOWN")).toBe(500);
	});
});
