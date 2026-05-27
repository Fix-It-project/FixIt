import { describe, expect, it } from "vitest";
import type { ZodError } from "zod";
import { mapZodError } from "./map-zod";

function makeZodError(
	issues: Array<{ path: ReadonlyArray<PropertyKey>; message: string }>,
): ZodError {
	return { issues } as unknown as ZodError;
}

describe("mapZodError", () => {
	it("flat issue at path ['email'] → fields = { email: msg }", () => {
		const z = makeZodError([{ path: ["email"], message: "Required" }]);
		const e = mapZodError(z);
		expect(e.code).toBe("VALIDATION");
		expect(e.opts.fields).toEqual({ email: "Required" });
	});

	it("nested path ['user','phone'] → fields = { 'user.phone': msg }", () => {
		const z = makeZodError([
			{ path: ["user", "phone"], message: "Invalid number" },
		]);
		const e = mapZodError(z);
		expect(e.opts.fields).toEqual({ "user.phone": "Invalid number" });
	});

	it("multiple issues → all paths as flat dotted keys", () => {
		const z = makeZodError([
			{ path: ["email"], message: "Required" },
			{ path: ["address", "zip"], message: "Bad zip" },
			{ path: ["address", "city"], message: "Required" },
		]);
		const e = mapZodError(z);
		expect(e.opts.fields).toEqual({
			email: "Required",
			"address.zip": "Bad zip",
			"address.city": "Required",
		});
	});

	it("empty issues → fields = {}", () => {
		const z = makeZodError([]);
		const e = mapZodError(z);
		expect(e.code).toBe("VALIDATION");
		expect(e.opts.fields).toEqual({});
	});

	it("issue with empty path goes under '_'", () => {
		const z = makeZodError([{ path: [], message: "Root" }]);
		const e = mapZodError(z);
		expect(e.opts.fields).toEqual({ _: "Root" });
	});

	it("first issue wins per path key", () => {
		const z = makeZodError([
			{ path: ["email"], message: "Required" },
			{ path: ["email"], message: "Bad format" },
		]);
		const e = mapZodError(z);
		expect(e.opts.fields).toEqual({ email: "Required" });
	});

	it("attaches original ZodError as cause", () => {
		const z = makeZodError([{ path: ["x"], message: "y" }]);
		const e = mapZodError(z);
		expect((e as unknown as { cause?: unknown }).cause).toBe(z);
	});
});
