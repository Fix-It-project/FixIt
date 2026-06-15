/** Formats integer EGP amounts for the dashboard ("EGP 1,240"). */
export function formatEgp(amount: number): string {
	return `EGP ${Math.round(amount).toLocaleString("en-EG")}`;
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
