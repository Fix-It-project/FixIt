export const radius = {
	compact: 8,
	card: 16,
	hero: 24,
	input: 12,
	button: 12,
	sheet: 20,
	chip: 9999,
	pill: 9999,
	controlSegmented: 12,
	controlSegmentedItem: 8,
} as const;

export type Radius = typeof radius;
