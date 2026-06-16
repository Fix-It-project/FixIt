// Small in-feature formatters for the Jobs cards. Kept local (not imported from
// techhome) to respect the no-cross-feature-imports rule.

import {
	formatDate,
	getDateLocale,
} from "@/src/features/booking-orders/utils/booking-helpers";

/** "3.4 km" or null when no distance was recorded. */
export function formatJobDistanceKm(km?: number | null): string | null {
	if (km == null) return null;
	return `${km.toFixed(1)} km`;
}

function ymd(date: Date): string {
	const y = date.getFullYear();
	const m = `${date.getMonth() + 1}`.padStart(2, "0");
	const d = `${date.getDate()}`.padStart(2, "0");
	return `${y}-${m}-${d}`;
}

/**
 * Human date-group label: "Today" / "Tomorrow" / "Yesterday" else a formatted
 * date ("Mar 27, 2026"). Relative to the device's local day.
 */
export function formatJobDateLabel(dateStr: string, language?: string): string {
	const now = new Date();
	const today = ymd(now);
	const tomorrow = ymd(new Date(now.getTime() + 86_400_000));
	const yesterday = ymd(new Date(now.getTime() - 86_400_000));
	if (dateStr === today) return "Today";
	if (dateStr === tomorrow) return "Tomorrow";
	if (dateStr === yesterday) return "Yesterday";
	return formatDate(dateStr, language);
}

export { getDateLocale };
