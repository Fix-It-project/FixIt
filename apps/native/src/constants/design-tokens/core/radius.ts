/**
 * Fixed-pixel radius tokens.
 *
 * NOTE: The shadcn/rn-primitives small/medium/large radius classes remain var-backed
 * via `--radius` and are intentionally untouched. These tokens live under
 * NEW names so both systems coexist without collision.
 */
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
