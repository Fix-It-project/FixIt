import { describe, expect, it } from "vitest";
import { mapPostgrestError } from "./map-supabase";

describe("mapPostgrestError", () => {
	it("PGRST116 → NOT_FOUND", () => {
		expect(mapPostgrestError({ code: "PGRST116" }).code).toBe("NOT_FOUND");
	});

	it("23505 → CONFLICT", () => {
		expect(mapPostgrestError({ code: "23505" }).code).toBe("CONFLICT");
	});

	it("23503 → VALIDATION", () => {
		expect(mapPostgrestError({ code: "23503" }).code).toBe("VALIDATION");
	});

	it("42501 → FORBIDDEN", () => {
		expect(mapPostgrestError({ code: "42501" }).code).toBe("FORBIDDEN");
	});

	it("57014 → TIMEOUT", () => {
		expect(mapPostgrestError({ code: "57014" }).code).toBe("TIMEOUT");
	});

	it("unknown code → SERVER", () => {
		expect(mapPostgrestError({ code: "PGRST999" }).code).toBe("SERVER");
	});

	it("missing code → SERVER", () => {
		expect(mapPostgrestError({}).code).toBe("SERVER");
	});

	it("null err → SERVER", () => {
		expect(mapPostgrestError(null).code).toBe("SERVER");
	});

	it("undefined err → SERVER", () => {
		expect(mapPostgrestError(undefined).code).toBe("SERVER");
	});

	it("preserves message on opts.devMessage", () => {
		const e = mapPostgrestError({ code: "23505", message: "duplicate key" });
		expect(e.opts.devMessage).toBe("duplicate key");
	});

	it("attaches original err as cause", () => {
		const raw = { code: "23505", message: "duplicate key" };
		const e = mapPostgrestError(raw);
		expect((e as unknown as { cause?: unknown }).cause).toBe(raw);
	});
});
