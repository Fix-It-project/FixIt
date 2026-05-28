/**
 * Counts how many reviews fall into each star bucket (1..5).
 *
 * Pure function — caller owns memoization. Reviews with a missing or out-of-range
 * rating are ignored so the result always sums to ≤ reviews.length.
 */
export function getReviewDistribution(
	reviews: ReadonlyArray<{ rating: number | null }>,
): Record<1 | 2 | 3 | 4 | 5, number> {
	const dist: Record<1 | 2 | 3 | 4 | 5, number> = {
		1: 0,
		2: 0,
		3: 0,
		4: 0,
		5: 0,
	};
	for (const r of reviews) {
		if (r.rating != null && r.rating >= 1 && r.rating <= 5) {
			dist[r.rating as 1 | 2 | 3 | 4 | 5]++;
		}
	}
	return dist;
}
