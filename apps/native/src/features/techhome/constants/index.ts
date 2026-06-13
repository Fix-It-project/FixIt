/** Stagger delay between section entrance animations (ms). */
export const SECTION_STAGGER_MS = 90;

/** Entrance animation duration for dashboard sections (ms). */
export const SECTION_ENTER_DURATION_MS = 420;

/** Height of the 7-day earnings bar chart (px). */
export const EARNINGS_CHART_HEIGHT = 96;

/** How often pending-request countdowns re-render (ms). */
export const EXPIRY_TICK_MS = 60_000;

/**
 * Hardcoded promo content — the rewards system isn't built yet. PromoCard is
 * fully presentational; when rewards ship, feed it server data instead.
 */
export const PROMO_PLACEHOLDER = {
	badgeLabel: "Rewards — coming soon",
	title: "Finish jobs, earn bonuses",
	body: "A rewards program for top technicians is on its way. Keep your acceptance rate high to qualify early.",
} as const;
