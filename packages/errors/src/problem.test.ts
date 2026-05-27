import { describe, expect, it } from "vitest";
import { AppError } from "./index";
import { fromProblemDetails, toProblemDetails } from "./problem";

describe("toProblemDetails", () => {
	it("returns RFC 9457 shape with code + userMessage", () => {
		const err = new AppError("VALIDATION", "fix the form", { status: 422 });
		const p = toProblemDetails(err, { url: "/api/x" });
		expect(p.code).toBe("VALIDATION");
		expect(p.userMessage).toBe("fix the form");
		expect(p.status).toBe(422);
		expect(p.type).toBe("https://fixit.app/errors/validation");
		expect(p.title).toBe("Validation failed");
		expect(p.instance).toBe("/api/x");
	});

	it("derives status from code when opts.status missing", () => {
		const err = new AppError("UNAUTHENTICATED", "sign in");
		const p = toProblemDetails(err);
		expect(p.status).toBe(401);
	});

	it("includes detail from devMessage when set", () => {
		const err = new AppError("SERVER", "try again", {
			devMessage: "PG insert failed",
		});
		const p = toProblemDetails(err);
		expect(p.detail).toBe("PG insert failed");
	});

	it("includes fields and token when present", () => {
		const err = new AppError("VALIDATION", "check", {
			fields: { email: "required" },
			token: "abc",
		});
		const p = toProblemDetails(err);
		expect(p.fields).toEqual({ email: "required" });
		expect(p.token).toBe("abc");
	});
});

describe("fromProblemDetails", () => {
	it("parses RFC 9457 shape (code + userMessage present)", () => {
		const json = {
			type: "https://fixit.app/errors/validation",
			title: "Validation failed",
			status: 422,
			code: "VALIDATION",
			userMessage: "Please check the form",
			fields: { email: "required" },
			token: "abc",
			detail: "Server-side: bad zod",
		};
		const err = fromProblemDetails(json);
		expect(err.code).toBe("VALIDATION");
		expect(err.userMessage).toBe("Please check the form");
		expect(err.opts.status).toBe(422);
		expect(err.opts.fields).toEqual({ email: "required" });
		expect(err.opts.token).toBe("abc");
		expect(err.opts.devMessage).toBe("Server-side: bad zod");
	});

	it("parses legacy { error: string }", () => {
		const err = fromProblemDetails({ error: "Something broke" });
		expect(err.code).toBe("UNKNOWN");
		expect(err.userMessage).toBe("Something broke");
	});

	it("parses legacy { error: { code, message, hint } }", () => {
		const err = fromProblemDetails({
			error: { code: "NOT_FOUND", message: "Missing row", hint: "row id=42" },
		});
		expect(err.code).toBe("NOT_FOUND");
		expect(err.userMessage).toBe("Missing row");
		expect(err.opts.devMessage).toBe("row id=42");
	});

	it("falls back to UNKNOWN for primitives (null, number, string)", () => {
		expect(fromProblemDetails(null).code).toBe("UNKNOWN");
		expect(fromProblemDetails(42).code).toBe("UNKNOWN");
		expect(fromProblemDetails("oops").code).toBe("UNKNOWN");
	});

	it("falls back to UNKNOWN for empty objects", () => {
		const err = fromProblemDetails({});
		expect(err.code).toBe("UNKNOWN");
		expect(err.userMessage).toBe("Something went wrong. Please try again.");
	});

	it("coerces unknown code strings to UNKNOWN", () => {
		const err = fromProblemDetails({
			code: "WAT",
			userMessage: "Server said wat",
		});
		expect(err.code).toBe("UNKNOWN");
		expect(err.userMessage).toBe("Server said wat");
	});

	it("ignores non-string fields entries", () => {
		const err = fromProblemDetails({
			code: "VALIDATION",
			userMessage: "x",
			fields: { email: "required", count: 5 },
		});
		expect(err.opts.fields).toEqual({ email: "required" });
	});
});
