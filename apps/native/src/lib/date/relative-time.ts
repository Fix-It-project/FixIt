/**
 * Format an ISO timestamp as a human-readable relative duration ("Xm ago", "Xy ago").
 *
 * `now` is injectable so this stays unit-testable without a mocked global Date.
 */
export function formatRelativeTime(
	iso: string,
	now: Date = new Date(),
): string {
	const then = Date.parse(iso);
	if (Number.isNaN(then)) return "";
	const seconds = Math.floor((now.getTime() - then) / 1000);
	if (seconds < 60) return "just now";
	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h ago`;
	const days = Math.floor(hours / 24);
	if (days < 30) return `${days}d ago`;
	const months = Math.floor(days / 30);
	if (months < 12) return `${months}mo ago`;
	return `${Math.floor(days / 365)}y ago`;
}
