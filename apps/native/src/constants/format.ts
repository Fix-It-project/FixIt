export const RATING_FRACTION_DIGITS = 2;

export function formatRating(value: number): string {
	return value.toFixed(RATING_FRACTION_DIGITS);
}
