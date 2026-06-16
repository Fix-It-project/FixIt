/**
 * Display formatters for order schedule timestamps. The server stores
 * `scheduled_start_at` as a `timestamptz`; never string-slice the ISO value —
 * format it in Cairo time so what the technician sees matches the booking slot.
 */
import i18n from "@/src/config/i18n";

const CAIRO_TZ = "Africa/Cairo";

const locale = () => i18n.language || "en";

/** "HH:mm" in Cairo time, or "—" when there's no usable timestamp. */
export function formatSlotTime(iso: string | null | undefined): string {
	if (!iso) return "—";
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return "—";
	return new Intl.DateTimeFormat(locale(), {
		timeZone: CAIRO_TZ,
		hour: "numeric",
		minute: "2-digit",
	}).format(date);
}

/** Short weekday ("Sat") for a YYYY-MM-DD scheduled_date. */
export function formatSlotWeekday(dateOnly: string | null | undefined): string {
	if (!dateOnly) return "";
	// Parse as a local calendar day to avoid a UTC-midnight weekday shift.
	const [year, month, day] = dateOnly.split("-").map(Number);
	if (!year || !month || !day) return "";
	return new Intl.DateTimeFormat(locale(), {
		timeZone: CAIRO_TZ,
		weekday: "short",
	}).format(new Date(year, month - 1, day, 12));
}
