// Date helpers for the technician schedule. Anchored to Africa/Cairo so "today"
// matches the AvailabilityCalendar + the server's day boundaries.

const CAIRO_TZ = "Africa/Cairo";

/** Today in Cairo as YYYY-MM-DD (en-CA formats as ISO date). */
export function cairoTodayYmd(): string {
	return new Intl.DateTimeFormat("en-CA", {
		timeZone: CAIRO_TZ,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(new Date());
}

export function ymdToDate(ymd: string): Date {
	return new Date(`${ymd}T00:00:00`);
}

/** Weekday for a plain YYYY-MM-DD (0=Sunday). Timezone-safe (fixed components). */
export function dayOfWeek(ymd: string): number {
	return ymdToDate(ymd).getDay();
}

/** Add (or subtract) whole days via UTC math — DST-safe. */
export function addDaysYmd(ymd: string, days: number): string {
	const [y, m, d] = ymd.split("-").map(Number);
	return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** The Sunday that starts the week containing `ymd`. */
export function startOfWeekYmd(ymd: string): string {
	return addDaysYmd(ymd, -dayOfWeek(ymd));
}

/** The seven YYYY-MM-DD dates (Sun→Sat) of the week containing `anchor`. */
export function weekDays(anchor: string): string[] {
	const start = startOfWeekYmd(anchor);
	return Array.from({ length: 7 }, (_, i) => addDaysYmd(start, i));
}

/** Day-of-month number from a YYYY-MM-DD. */
export function dayNumber(ymd: string): number {
	return Number(ymd.slice(8, 10));
}
