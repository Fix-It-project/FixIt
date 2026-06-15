import { AppError } from "../errors/index.js";

const CAIRO_TZ = "Africa/Cairo";
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Returns the current instant. Use as the time origin for arithmetic involving
 * Cairo wall-clock dates (use cairoMidnightUtc + hoursBetween for the comparison).
 */
export function nowInCairo(): Date {
	return new Date();
}

/**
 * Returns the UTC Date instant corresponding to 00:00:00 Africa/Cairo on the
 * provided YYYY-MM-DD date string. Handles DST automatically via Intl.
 */
export function cairoMidnightUtc(dateStr: string): Date {
	if (!ISO_DATE.test(dateStr)) {
		throw AppError.badRequest("Invalid date format. Use YYYY-MM-DD.");
	}
	const [yStr, mStr, dStr] = dateStr.split("-");
	const y = Number(yStr);
	const m = Number(mStr);
	const d = Number(dStr);

	const guess = Date.UTC(y, m - 1, d, 0, 0, 0, 0);
	const cairoParts = new Intl.DateTimeFormat("en-US", {
		timeZone: CAIRO_TZ,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false,
	}).formatToParts(new Date(guess));
	const get = (t: string) =>
		Number(cairoParts.find((p) => p.type === t)?.value ?? 0);
	const cairoH = get("hour") === 24 ? 0 : get("hour");
	const cairoM = get("minute");
	const cairoS = get("second");
	const offsetMs = ((cairoH * 60 + cairoM) * 60 + cairoS) * 1000;
	return new Date(guess - offsetMs);
}

/**
 * Returns the signed number of hours from `a` to `b` (positive when b is after a).
 */
export function hoursBetween(a: Date, b: Date): number {
	return (b.getTime() - a.getTime()) / 3_600_000;
}

/**
 * Returns the YYYY-MM-DD string for the Cairo calendar day of `instant`.
 */
export function cairoDateString(instant: Date): string {
	const parts = new Intl.DateTimeFormat("en-CA", {
		timeZone: CAIRO_TZ,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).formatToParts(instant);
	const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
	return `${get("year")}-${get("month")}-${get("day")}`;
}

/**
 * Shifts a YYYY-MM-DD date string by `days` in pure calendar space (no TZ math).
 */
export function shiftDateString(dateStr: string, days: number): string {
	if (!ISO_DATE.test(dateStr)) {
		throw AppError.badRequest("Invalid date format. Use YYYY-MM-DD.");
	}
	const [y, m, d] = dateStr.split("-").map(Number);
	const shifted = new Date(
		Date.UTC(y as number, (m as number) - 1, (d as number) + days),
	);
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())}`;
}

/**
 * UTC instant of 00:00 Africa/Cairo today.
 */
export function cairoStartOfToday(now: Date = new Date()): Date {
	return cairoMidnightUtc(cairoDateString(now));
}

/**
 * UTC instant of 00:00 Africa/Cairo yesterday.
 */
export function cairoStartOfYesterday(now: Date = new Date()): Date {
	return cairoMidnightUtc(shiftDateString(cairoDateString(now), -1));
}

/**
 * UTC instant of 00:00 Africa/Cairo on the first day of the current week.
 * Week starts Sunday (Egyptian workweek; weekend is Fri/Sat).
 */
export function cairoStartOfWeek(now: Date = new Date()): Date {
	const todayStr = cairoDateString(now);
	const weekday = new Intl.DateTimeFormat("en-US", {
		timeZone: CAIRO_TZ,
		weekday: "short",
	}).format(now);
	const order = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
	const offset = order.indexOf(weekday);
	return cairoMidnightUtc(shiftDateString(todayStr, -Math.max(offset, 0)));
}

/**
 * The last `n` Cairo calendar days as YYYY-MM-DD strings, oldest first,
 * ending with today. Drives the dashboard daily-earnings series.
 */
export function cairoLastNDays(n: number, now: Date = new Date()): string[] {
	const todayStr = cairoDateString(now);
	const days: string[] = [];
	for (let i = n - 1; i >= 0; i--) {
		days.push(shiftDateString(todayStr, -i));
	}
	return days;
}
