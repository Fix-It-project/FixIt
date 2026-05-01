export const SORT_OPTIONS = [
	"Recommended",
	"Top Rated",
	"Nearest",
	"Most Reviews",
] as const;
export type SortKey = (typeof SORT_OPTIONS)[number];
