import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn()", () => {
	it("merges class names and dedupes conflicting Tailwind utilities", () => {
		expect(cn("p-2", "p-4", "text-sm")).toBe("p-4 text-sm");
	});

	it("filters falsy values", () => {
		expect(cn("a", false && "b", undefined, null, "c")).toBe("a c");
	});
});
