import i18n from "@/src/config/i18n";

/**
 * Formats the inspection distance for the dashboard ("3.4 km"). Returns null
 * when the order has no distance recorded so callers can skip rendering.
 */
export function formatDistanceKm(km: number | null | undefined): string | null {
	if (km == null) return null;
	const value = km.toLocaleString(i18n.language || "en", {
		minimumFractionDigits: 1,
		maximumFractionDigits: 1,
	});
	return `${value} ${i18n.t("technician:calendar.units.km")}`;
}
