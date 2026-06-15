import { describe, expect, it } from "vitest";
import {
	cairoLastNDays,
	cairoStartOfToday,
	cairoStartOfWeek,
	cairoStartOfYesterday,
	shiftDateString,
} from "../../cairo-time.js";

// Winter instant: Thursday 2026-01-15 14:00 Cairo (EET, UTC+2).
const WINTER = new Date("2026-01-15T12:00:00.000Z");
// Summer instant: Wednesday 2026-07-15 15:00 Cairo (EEST, UTC+3 — Egypt DST).
const SUMMER = new Date("2026-07-15T12:00:00.000Z");

describe("shiftDateString", () => {
	it("shifts within a month", () => {
		expect(shiftDateString("2026-01-15", -3)).toBe("2026-01-12");
	});

	it("rolls over month and year boundaries", () => {
		expect(shiftDateString("2026-01-02", -5)).toBe("2025-12-28");
		expect(shiftDateString("2026-12-30", 5)).toBe("2027-01-04");
	});
});

describe("cairoStartOfToday / cairoStartOfYesterday", () => {
	it("returns Cairo midnight as a UTC instant (winter, UTC+2)", () => {
		expect(cairoStartOfToday(WINTER).toISOString()).toBe(
			"2026-01-14T22:00:00.000Z",
		);
		expect(cairoStartOfYesterday(WINTER).toISOString()).toBe(
			"2026-01-13T22:00:00.000Z",
		);
	});

	it("handles Egyptian DST (summer, UTC+3)", () => {
		expect(cairoStartOfToday(SUMMER).toISOString()).toBe(
			"2026-07-14T21:00:00.000Z",
		);
	});
});

describe("cairoStartOfWeek", () => {
	it("snaps to the previous Sunday (Egyptian workweek)", () => {
		// 2026-01-15 is a Thursday → week start Sunday 2026-01-11.
		expect(cairoStartOfWeek(WINTER).toISOString()).toBe(
			"2026-01-10T22:00:00.000Z",
		);
	});

	it("is idempotent on a Sunday", () => {
		// 2026-01-11 is a Sunday.
		const sunday = new Date("2026-01-11T12:00:00.000Z");
		expect(cairoStartOfWeek(sunday).toISOString()).toBe(
			"2026-01-10T22:00:00.000Z",
		);
	});
});

describe("cairoLastNDays", () => {
	it("returns N calendar days oldest-first ending today", () => {
		expect(cairoLastNDays(7, WINTER)).toEqual([
			"2026-01-09",
			"2026-01-10",
			"2026-01-11",
			"2026-01-12",
			"2026-01-13",
			"2026-01-14",
			"2026-01-15",
		]);
	});

	it("crosses month boundaries", () => {
		const firstOfMonth = new Date("2026-02-02T12:00:00.000Z");
		expect(cairoLastNDays(3, firstOfMonth)).toEqual([
			"2026-01-31",
			"2026-02-01",
			"2026-02-02",
		]);
	});
});
