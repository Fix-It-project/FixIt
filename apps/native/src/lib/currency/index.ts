/**
 * Shared EGP money formatter. Cross-feature helper (profile + dashboard both
 * render earnings), so it lives in lib/ rather than inside a single feature.
 * Locale-aware grouping; the "EGP" unit label is translated.
 */
import i18n from "@/src/config/i18n";

export function formatEgp(amount: number): string {
	const value = Math.round(amount).toLocaleString(i18n.language || "en");
	return `${value} ${i18n.t("technician:calendar.units.egp")}`;
}
