/**
 * Fixed-pixel radius tokens.
 *
 * NOTE: The shadcn/rn-primitives `rounded-sm/md/lg` classes remain var-backed
 * via `--radius` and are intentionally untouched. These tokens live under
 * NEW names so both systems coexist without collision.
 */
export const radius = {
	card: 16,
	input: 12,
	button: 12,
	sheet: 20,
	chip: 9999,
	pill: 9999,
} as const;

export type Radius = typeof radius;
