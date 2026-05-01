/**
 * Elevation / shadow token scale.
 *
 * Four semantic tiers. Consume via `shadowStyle(elevation.raised)` to produce a
 * React Native style object with shadow* + elevation set consistently.
 *
 * Tier mapping (by `offsetY`):
 *  - flat:   list rows, subtle cards, calendar triggers
 *  - raised: standard cards, chips, toggles
 *  - header: tab bars, sticky headers, dashboard headers
 *  - modal:  modals, role cards, elevated primary surfaces
 */
export const elevation = {
	flat: {
		offsetY: 1,
		radius: 4,
		opacity: 0.04,
		android: 1,
	},
	raised: {
		offsetY: 2,
		radius: 8,
		opacity: 0.06,
		android: 2,
	},
	header: {
		offsetY: 4,
		radius: 10,
		opacity: 0.08,
		android: 4,
	},
	modal: {
		offsetY: 10,
		radius: 24,
		opacity: 0.14,
		android: 10,
	},
} as const;

export type ElevationTier = (typeof elevation)[keyof typeof elevation];

/**
 * Build a cross-platform shadow style from an elevation tier.
 * Pass a theme-aware `shadowColor` for best results; defaults to opaque black,
 * which React Native multiplies by `shadowOpacity`.
 *
 * Per-site overrides (e.g. colored shadows on tab center button) can still pass
 * a `shadowColor` or override `opacity`.
 */
export function shadowStyle(
	tier: ElevationTier,
	options?: {
		shadowColor?: string;
		opacity?: number;
		offsetY?: number;
		radius?: number;
		android?: number;
	},
) {
	return {
		shadowColor: options?.shadowColor ?? "#000",
		shadowOffset: { width: 0, height: options?.offsetY ?? tier.offsetY },
		shadowOpacity: options?.opacity ?? tier.opacity,
		shadowRadius: options?.radius ?? tier.radius,
		elevation: options?.android ?? tier.android,
	};
}
