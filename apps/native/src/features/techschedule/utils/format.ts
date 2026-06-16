// Small in-feature formatters (kept local to honor no-cross-feature-imports).
// Locale-aware: digits, time and dates follow the active i18n language, and unit
// words (EGP/km) are translated. Components that render these also subscribe to
// `useTranslation`, so a language switch re-renders and re-formats them.

import i18n from "@/src/config/i18n";

const locale = () => i18n.language || "en";

export function formatEgp(amount?: number | null): string | null {
	if (amount == null || amount <= 0) return null;
	const value = Math.round(amount).toLocaleString(locale());
	return `${value} ${i18n.t("technician:calendar.units.egp")}`;
}

export function formatKm(km?: number | null): string | null {
	if (km == null) return null;
	const value = km.toLocaleString(locale(), {
		minimumFractionDigits: 1,
		maximumFractionDigits: 1,
	});
	return `${value} ${i18n.t("technician:calendar.units.km")}`;
}

export function formatTimeFromIso(iso?: string | null): string | null {
	if (!iso) return null;
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return null;
	return new Intl.DateTimeFormat(locale(), {
		hour: "numeric",
		minute: "2-digit",
	}).format(d);
}

/** "Tuesday, Mar 31" for a YYYY-MM-DD, in the active language. */
export function formatLongDate(ymd: string): string {
	const d = new Date(`${ymd}T00:00:00`);
	if (Number.isNaN(d.getTime())) return ymd;
	return new Intl.DateTimeFormat(locale(), {
		weekday: "long",
		month: "short",
		day: "numeric",
	}).format(d);
}
