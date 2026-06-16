/**
 * Formats the inspection distance for the dashboard ("3.4 km"). Returns null
 * when the order has no distance recorded so callers can skip rendering.
 */
export function formatDistanceKm(km: number | null | undefined): string | null {
	if (km == null) return null;
	return `${km.toFixed(1)} km`;
}
