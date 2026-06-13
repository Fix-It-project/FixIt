import { afterEach, describe, expect, it, vi } from "vitest";
import {
	cairoDateString,
	cairoMidnightUtc,
	hoursBetween,
	nowInCairo,
} from "../../cairo-time.js";

afterEach(() => {
	vi.useRealTimers();
});

describe("cairoMidnightUtc", () => {
	it("returns UTC+2 offset before Egypt DST starts (2026-04-23)", () => {
		const d = cairoMidnightUtc("2026-04-23");
		expect(d.toISOString()).toBe("2026-04-22T22:00:00.000Z");
	});

	it("returns UTC+3 offset during Egypt DST (2026-05-01)", () => {
		const d = cairoMidnightUtc("2026-05-01");
		expect(d.toISOString()).toBe("2026-04-30T21:00:00.000Z");
	});

	it("returns UTC+2 after DST ends (2026-12-31)", () => {
		const d = cairoMidnightUtc("2026-12-31");
		expect(d.toISOString()).toBe("2026-12-30T22:00:00.000Z");
	});

	it("throws on invalid format", () => {
		expect(() => cairoMidnightUtc("05/01/2026")).toThrow(/Invalid date format/);
	});
});

describe("hoursBetween", () => {
	it("returns 24 for one day apart", () => {
		const a = new Date("2026-05-01T00:00:00Z");
		const b = new Date("2026-05-02T00:00:00Z");
		expect(hoursBetween(a, b)).toBe(24);
	});
	it("returns negative when b precedes a", () => {
		const a = new Date("2026-05-02T00:00:00Z");
		const b = new Date("2026-05-01T00:00:00Z");
		expect(hoursBetween(a, b)).toBe(-24);
	});
});

describe("cairoDateString", () => {
	it("returns the Cairo calendar day for a UTC instant just before midnight Cairo", () => {
		expect(cairoDateString(new Date("2026-05-01T20:00:00Z"))).toBe(
			"2026-05-01",
		);
		expect(cairoDateString(new Date("2026-05-01T22:00:00Z"))).toBe(
			"2026-05-02",
		);
	});
});

describe("nowInCairo", () => {
	it("returns a Date whose UTC time equals system now (with vi.setSystemTime)", () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-05-01T12:00:00Z"));
		expect(nowInCairo().toISOString()).toBe("2026-05-01T12:00:00.000Z");
	});
});
