/** Formats integer EGP amounts for the dashboard ("EGP 1,240"). */
import i18n from "@/src/config/i18n";

export function formatEgp(amount: number): string {
	const value = Math.round(amount).toLocaleString(i18n.language || "en");
	return `${value} ${i18n.t("technician:calendar.units.egp")}`;
}

/**
 * Percent delta of today vs yesterday. Undefined when yesterday is 0 (no
 * meaningful baseline — the UI hides the chip instead of showing +Infinity%).
 */
export function earningsDeltaPct(
	today: number,
	yesterday: number,
): number | undefined {
	if (yesterday <= 0) return undefined;
	return Math.round(((today - yesterday) / yesterday) * 100);
}
