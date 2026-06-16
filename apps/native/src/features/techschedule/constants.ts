// Fixed booking slot hours (Cairo local) — the user booking flow depends on this
// exact set, so the technician setup screen offers the same five.
export const SLOT_HOURS = [8, 11, 14, 17, 20] as const;
export type SlotHour = (typeof SLOT_HOURS)[number];

export const DAY_NAMES = [
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
] as const;

export const SHORT_DAY_NAMES = [
	"Sun",
	"Mon",
	"Tue",
	"Wed",
	"Thu",
	"Fri",
	"Sat",
] as const;

/**
 * Statuses that mean "the technician has a live commitment on this day" — used
 * to paint order dots on the calendar + populate the day panel. Mirrors the
 * canonical ACTIVE_STATUSES ∪ RESCHEDULE_PENDING_STATUSES from booking-orders'
 * order-status.schema (duplicated locally to avoid a cross-feature import).
 */
export const SCHEDULE_VISIBLE_STATUSES: ReadonlySet<string> = new Set([
	"accepted",
	"tracking",
	"arrived_inspection",
	"awaiting_final_cost",
	"negotiating",
	"in_progress",
	"awaiting_payment",
	"reschedule_requested_by_user",
	"reschedule_requested_by_technician",
]);

/** Friendly label for a slot hour, e.g. 8 → "8:00 AM", 14 → "2:00 PM". */
export function formatSlotHour(hour: number): string {
	const period = hour >= 12 ? "PM" : "AM";
	const display = hour % 12 === 0 ? 12 : hour % 12;
	return `${display}:00 ${period}`;
}
