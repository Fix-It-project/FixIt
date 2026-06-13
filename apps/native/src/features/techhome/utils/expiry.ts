/**
 * Countdown until a pending order is auto-rejected by the backend sweeper.
 * Deadline = created_at + pendingExpiryHours (value delivered by
 * GET /api/technicians/me/stats so the app needn't hardcode the DB interval).
 */
export interface PendingExpiry {
	/** Milliseconds remaining; 0 when already past the deadline. */
	remainingMs: number;
	/** 1 → just created, 0 → expired. Drives the countdown bar width. */
	fraction: number;
	/** Compact human label, e.g. "5h 12m" / "48m" / "Expiring". */
	label: string;
}

function expiryLabel(remainingMs: number): string {
	if (remainingMs === 0) return "Expired";
	const totalMinutes = Math.floor(remainingMs / 60_000);
	if (totalMinutes < 5) return "Expiring";
	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;
	return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

export function pendingExpiryFor(
	createdAtIso: string | undefined,
	pendingExpiryHours: number,
	now: Date = new Date(),
): PendingExpiry | undefined {
	if (!createdAtIso) return undefined;
	const createdAt = new Date(createdAtIso).getTime();
	if (Number.isNaN(createdAt)) return undefined;

	const totalMs = pendingExpiryHours * 3_600_000;
	const remainingMs = Math.max(0, createdAt + totalMs - now.getTime());
	const fraction = totalMs > 0 ? remainingMs / totalMs : 0;

	return { remainingMs, fraction, label: expiryLabel(remainingMs) };
}
