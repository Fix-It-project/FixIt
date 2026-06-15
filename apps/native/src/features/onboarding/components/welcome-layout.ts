import { space } from "@/src/constants/design-tokens";

// Cropped wordmark aspect (~800:220) — height follows width. Mirrors BrandMark.
const WORDMARK_RATIO = 0.28;

// The wordmark reads as a small logo above the hero, never the focal point.
const BRAND_WIDTH_RATIO = 0.3;
const BRAND_WIDTH_MAX = 120;

// The illustration is the hero: it fills the available width, only shrinking when
// the panel is too short to fit it. Caps keep it sane on tablets / wide split-screens.
const ILLUSTRATION_WIDTH_RATIO = 0.92;
const ILLUSTRATION_MAX = 460;
const ILLUSTRATION_MIN = 160;

export function brandMarkWidthFor(screenW: number): number {
	return Math.min(screenW * BRAND_WIDTH_RATIO, BRAND_WIDTH_MAX);
}

/**
 * Largest hero size that fits the blue panel: width-bound on phones (dominant,
 * Walmart-style), height-bound on short panels (split-screen / small devices).
 *
 * @param panelHeight visible height of the blue panel
 * @param topPad      space consumed above the wordmark (insets + padding)
 */
export function illustrationSizeFor(
	screenW: number,
	panelHeight: number,
	topPad: number,
): number {
	const brandMarkHeight = brandMarkWidthFor(screenW) * WORDMARK_RATIO;
	// Reserve room for the wordmark above and the motto/breathing room below.
	const available =
		panelHeight - topPad - brandMarkHeight - space[6] - space[12];
	return Math.max(
		ILLUSTRATION_MIN,
		Math.min(screenW * ILLUSTRATION_WIDTH_RATIO, available, ILLUSTRATION_MAX),
	);
}
