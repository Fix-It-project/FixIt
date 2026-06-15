/**
 * Display formatters for order schedule timestamps. The server stores
 * `scheduled_start_at` as a `timestamptz`; never string-slice the ISO value —
 * format it in Cairo time so what the technician sees matches the booking slot.
 */
const CAIRO_TZ = "Africa/Cairo";

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
	timeZone: CAIRO_TZ,
	hour: "2-digit",
	minute: "2-digit",
	hour12: false,
});

const weekdayFormatter = new Intl.DateTimeFormat("en-GB", {
	timeZone: CAIRO_TZ,
	weekday: "short",
});

/** "HH:mm" in Cairo time, or "—" when there's no usable timestamp. */
export function formatSlotTime(iso: string | null | undefined): string {
	if (!iso) return "—";
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return "—";
	return timeFormatter.format(date);
}

/** Short weekday ("Sat") for a YYYY-MM-DD scheduled_date. */
export function formatSlotWeekday(dateOnly: string | null | undefined): string {
	if (!dateOnly) return "";
	// Parse as a local calendar day to avoid a UTC-midnight weekday shift.
	const [year, month, day] = dateOnly.split("-").map(Number);
	if (!year || !month || !day) return "";
	return weekdayFormatter.format(new Date(year, month - 1, day, 12));
}
