// Small in-feature formatters (kept local to honor no-cross-feature-imports).

export function formatEgp(amount?: number | null): string | null {
	if (amount == null || amount <= 0) return null;
	return `${Math.round(amount).toLocaleString()} EGP`;
}

export function formatKm(km?: number | null): string | null {
	if (km == null) return null;
	return `${km.toFixed(1)} km`;
}

export function formatTimeFromIso(iso?: string | null): string | null {
	if (!iso) return null;
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return null;
	return new Intl.DateTimeFormat("en-US", {
		hour: "numeric",
		minute: "2-digit",
	}).format(d);
}

const WEEKDAY_LONG = new Intl.DateTimeFormat("en-US", {
	weekday: "long",
	month: "short",
	day: "numeric",
});

/** "Tuesday, Mar 31" for a YYYY-MM-DD. */
export function formatLongDate(ymd: string): string {
	const d = new Date(`${ymd}T00:00:00`);
	if (Number.isNaN(d.getTime())) return ymd;
	return WEEKDAY_LONG.format(d);
}
