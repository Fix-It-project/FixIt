import { describe, expect, it } from "vitest";
import { mapHttpError, mapHttpStatus } from "./map-http";

describe("mapHttpStatus", () => {
	it("400 → VALIDATION", () => {
		const e = mapHttpStatus(400);
		expect(e.code).toBe("VALIDATION");
		expect(e.opts.status).toBe(400);
	});

	it("400 with body.fields → opts.fields populated", () => {
		const e = mapHttpStatus(400, { fields: { email: "required" } });
		expect(e.code).toBe("VALIDATION");
		expect(e.opts.fields).toEqual({ email: "required" });
	});

	it("401 → UNAUTHENTICATED", () => {
		expect(mapHttpStatus(401).code).toBe("UNAUTHENTICATED");
	});

	it("403 → FORBIDDEN", () => {
		expect(mapHttpStatus(403).code).toBe("FORBIDDEN");
	});

	it("404 → NOT_FOUND", () => {
		expect(mapHttpStatus(404).code).toBe("NOT_FOUND");
	});

	it("409 → CONFLICT", () => {
		expect(mapHttpStatus(409).code).toBe("CONFLICT");
	});

	it("422 → VALIDATION with body.fields", () => {
		const e = mapHttpStatus(422, { fields: { name: "too short" } });
		expect(e.code).toBe("VALIDATION");
		expect(e.opts.fields).toEqual({ name: "too short" });
	});

	it("429 → RATE_LIMITED", () => {
		expect(mapHttpStatus(429).code).toBe("RATE_LIMITED");
	});

	it("500 → SERVER", () => {
		expect(mapHttpStatus(500).code).toBe("SERVER");
	});

	it("502 → SERVER", () => {
		expect(mapHttpStatus(502).code).toBe("SERVER");
	});

	it("504 → SERVER", () => {
		expect(mapHttpStatus(504).code).toBe("SERVER");
	});

	it("503 → MAINTENANCE", () => {
		expect(mapHttpStatus(503).code).toBe("MAINTENANCE");
	});

	it("undefined → NETWORK", () => {
		expect(mapHttpStatus(undefined).code).toBe("NETWORK");
	});

	it("0 → NETWORK", () => {
		expect(mapHttpStatus(0).code).toBe("NETWORK");
	});

	it("undefined + body.code ECONNABORTED → TIMEOUT", () => {
		expect(mapHttpStatus(undefined, { code: "ECONNABORTED" }).code).toBe(
			"TIMEOUT",
		);
	});

	it("body.userMessage is surfaced as userMessage", () => {
		const e = mapHttpStatus(400, { userMessage: "Custom message" });
		expect(e.userMessage).toBe("Custom message");
	});

	it("unhandled 4xx falls back to VALIDATION", () => {
		expect(mapHttpStatus(418).code).toBe("VALIDATION");
	});
});

describe("mapHttpError", () => {
	it("delegates to mapHttpStatus when response present", () => {
		const e = mapHttpError({ response: { status: 404 } });
		expect(e.code).toBe("NOT_FOUND");
	});

	it("ECONNABORTED → TIMEOUT", () => {
		const e = mapHttpError({ code: "ECONNABORTED" });
		expect(e.code).toBe("TIMEOUT");
	});

	it("no response + no abort → NETWORK", () => {
		const e = mapHttpError({});
		expect(e.code).toBe("NETWORK");
	});
});
