/**
 * Pure availability helpers shared by the booking calendar + time-slot grid.
 *
 * Extracted from the legacy BookingTimeStep so the logic has a single home.
 * Uses a structural template shape (no feature import) so any caller can pass
 * the public-schedule templates straight through.
 */

export interface DayTemplate {
	day_of_week: number;
	slot_hour?: number | null;
	active: boolean;
}

/**
 * Day-of-week for a `YYYY-MM-DD` string. The date components are fixed, so the
 * local-midnight Date yields the same weekday the server's
 * `EXTRACT(DOW FROM scheduled_date)` produces — timezone-independent for a
 * plain calendar date.
 */
export function getDayOfWeek(dateYmd: string): number {
	return new Date(`${dateYmd}T00:00:00`).getDay();
}

export function getDayTemplates<T extends DayTemplate>(
	templates: readonly T[],
	dayOfWeek: number,
): T[] {
	return templates.filter((t) => t.day_of_week === dayOfWeek);
}

/** A day is unavailable if it's an exception date or has no active template. */
export function isDayUnavailable(
	date: string,
	dayTemplates: readonly DayTemplate[],
	exceptionDates: ReadonlySet<string>,
): boolean {
	return exceptionDates.has(date) || !dayTemplates.some((t) => t.active);
}

/**
 * Whether a specific hour slot is offered on a day. Slot-level templates win;
 * otherwise a day-level (null slot_hour) active template opens every slot.
 */
export function isSlotAvailable(
	dayTemplates: readonly DayTemplate[],
	slotHour: number,
): boolean {
	const slotTemplates = dayTemplates.filter((t) => t.slot_hour === slotHour);
	if (slotTemplates.length > 0) {
		return slotTemplates.some((t) => t.active);
	}
	const dayLevelTemplates = dayTemplates.filter((t) => t.slot_hour == null);
	if (dayLevelTemplates.length > 0) {
		return dayLevelTemplates.some((t) => t.active);
	}
	return false;
}
