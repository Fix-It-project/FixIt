import colors from "tailwindcss/colors";
import { colorPrimitives, type Hsl } from "./primitives";
import type {
	ThemeCategoryTokens,
	ThemeId,
	ThemeNavigationTokens,
	ThemePrimitiveTokens,
	ThemeTint,
	ThemeTokens,
} from "./types";

/**
 * FixIt color system — revamped.
 *
 * SINGLE SOURCE OF TRUTH
 * Every brand/semantic color comes from one of the tonal scales below
 * (`blue`, `neutral`, `teal`, `green`, `red`, `amber`). Both the flat
 * semantic tokens AND the shadcn `primitives` are derived from the SAME
 * scale steps via `hex()` / `tok()`, so the two layers can no longer
 * disagree (that was the original bug: flat `primary` !== primitives.primary).
 *
 * PALETTE INTENT
 * - Brand: Walmart "True Blue" (#0053E2, brand-600) with "Bentonville Blue"
 *   (#001E60, brand-900) as the dark anchor. Both round-trip to the exact
 *   official hex. Walmart's Everyday/Sky secondary blues live in `sky`.
 * - Secondary: cool NEUTRAL — secondary buttons are neutral, not a 2nd hue
 *   (same approach as Linear / Stripe / shadcn). Lives in `secondary*`.
 * - Accent: a single CYAN (~190, cool) for links / highlights / chips. This
 *   replaces Walmart's Spark Yellow; it sits near their own Everyday Blue so it
 *   reads on-brand, not foreign. No yellow / orange / red used as accent.
 * - Semantic: MUTED green (success/available) and MUTED red (danger), tuned to
 *   the same cool, low-chroma family as the brand so they don't read as foreign
 *   alert colors. AMBER IS FUNCTIONAL ONLY (warning / unavailable / ratings) —
 *   never brand. Swap these to neutral if you want zero yellow anywhere.
 *
 * SEMANTIC USAGE (this is the part that makes it feel native, à la Uber/Linear):
 *   1. Color is sparse. Primary actions are brand-blue or neutral, NOT green/red.
 *      Show success with a brand/neutral button + checkmark + copy, not a green
 *      fill. Show a destructive action as red *text* on a neutral button.
 *   2. Default to tinted CONTAINERS, not solids: pale bg + deep on-color text
 *      (statusAvailable/dangerLight/dangerSoft/warningLight = the bg; pair with
 *      success/danger/warning as the text). Reserve solid fills for the single
 *      destructive confirm (primitives.destructive).
 *   3. success/danger/warning here are the muted ACCENT (text/icon/dot) values.
 *
 * DARK MODE is built on principles, not inversion:
 * - blue-tinted near-black base; elevation shown by LIGHTER surfaces
 *   (surfaceBase < surfaceElevated < popover), not shadows.
 * - accents use lighter, slightly desaturated steps so they don't vibrate.
 * - all text pairings verified >= WCAG AA (4.5:1); UI/large >= 3:1.
 *
 * DEPRECATED ALIASES (kept so existing imports don't break; migrate later):
 *   successAlt -> use `success`        accentPurple -> use `accentCyan`
 *   gradientRole* -> use gradient*      (textSecondary/textMuted now differ)
 */

type HSL = Hsl;

function hslToRgb([h, s, l]: HSL): [number, number, number] {
	const sN = s / 100;
	const lN = l / 100;
	const c = (1 - Math.abs(2 * lN - 1)) * sN;
	const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
	const m = lN - c / 2;
	let r = 0;
	let g = 0;
	let b = 0;
	if (h < 60) [r, g, b] = [c, x, 0];
	else if (h < 120) [r, g, b] = [x, c, 0];
	else if (h < 180) [r, g, b] = [0, c, x];
	else if (h < 240) [r, g, b] = [0, x, c];
	else if (h < 300) [r, g, b] = [x, 0, c];
	else [r, g, b] = [c, 0, x];
	return [
		Math.round((r + m) * 255),
		Math.round((g + m) * 255),
		Math.round((b + m) * 255),
	];
}

/** "#rrggbb" — for flat semantic tokens and anything consumed as a color string. */
function hex(t: HSL): string {
	const [r, g, b] = hslToRgb(t);
	const h = (n: number) => n.toString(16).padStart(2, "0");
	return `#${h(r)}${h(g)}${h(b)}`;
}

/** "H S% L%" — for shadcn/NativeWind primitive tokens (wrapped in hsl() at use). */
function tok([h, s, l]: HSL): string {
	return `${h} ${s}% ${l}%`;
}

// ----------------------------------------------------------------------------
// TONAL SCALES (the only place raw color values live)
// ----------------------------------------------------------------------------

// Walmart True Blue family — anchored to the official brand values:
//   600 = True Blue #0053E2   900 = Bentonville Blue #001E60
// (600 and 900 are pinned to the exact official hex via `wm()` below.)
const blue = colorPrimitives.blue;

// Walmart Everyday Blue / Sky Blue — the brand's own light secondary tints.
const sky: Record<number, HSL> = {
	300: [200, 83, 82], // Sky Blue #A9DDF7
	400: [200, 89, 72],
	500: [200, 89, 63], // Everyday Blue #4DBDF5
	600: [201, 80, 50],
};

// Cool, faintly blue-tinted neutral (replaces the ad-hoc slate usage).
const neutral: Record<number, HSL> = {
	50: [210, 22, 98],
	100: [214, 20, 95],
	200: [214, 17, 90],
	300: [214, 14, 82],
	400: [215, 12, 64],
	500: [215, 13, 48],
	600: [215, 17, 38],
	700: [216, 21, 28],
	800: [217, 26, 18],
	850: [219, 28, 13],
	900: [221, 32, 9],
	950: [222, 38, 6],
};

// Accent — cyan, pushed cool (~190) so it stays distinct from the 218 brand.
// This replaces Walmart's Spark Yellow: it sits in the same region as their own
// Everyday Blue secondary, so it reads as on-brand rather than a foreign hue.
const teal: Record<number, HSL> = {
	300: [187, 72, 66],
	400: [188, 78, 46],
	500: [189, 86, 37],
	600: [190, 90, 29],
	700: [191, 92, 23],
};

// Muted sage — desaturated so it harmonizes with the blue/neutral system
// instead of reading as a foreign "alert" green. Use as text/icon/dot or as a
// tinted container (50/100 bg + 600/700 text), rarely as a solid fill.
const green: Record<number, HSL> = {
	50: [150, 40, 96],
	100: [150, 38, 90],
	300: [152, 30, 62],
	400: [152, 33, 50],
	500: [154, 36, 37],
	600: [156, 40, 30],
	700: [158, 42, 24],
	950: [156, 35, 10],
};

// Muted brick — still clearly "danger" but not fire-engine fluorescent. Prefer
// red text on a neutral surface for destructive *labels*; reserve solid fills
// (red-600) for the final destructive confirmation only.
const red: Record<number, HSL> = {
	50: [6, 60, 96],
	100: [6, 55, 92],
	300: [6, 58, 72],
	400: [6, 60, 62],
	500: [6, 62, 48],
	600: [8, 62, 40],
	700: [8, 60, 32],
	900: [6, 45, 18],
	950: [6, 45, 11],
};

// FUNCTIONAL ONLY (warning / unavailable / ratings). Muted to an ochre so it
// reads as a calm status, not a highlighter. Not a brand color.
const amber: Record<number, HSL> = {
	100: [40, 75, 90],
	200: [40, 72, 80],
	300: [38, 70, 58],
	400: [36, 68, 48],
	500: [34, 66, 42],
	600: [32, 64, 35],
	700: [30, 62, 30],
	950: [34, 55, 11],
};

const white = "#ffffff";

// Default LIGHT theme: soft-gray page canvas (#f5f5f5) with WHITE cards above it.
const pageGray = "#f5f5f5";

// "WHITE" theme: gray card fill (#f2f2f2) above a pure-white page (inverse model).
const cardSurface = "#f2f2f2";

// ----------------------------------------------------------------------------
// Helpers (unchanged behavior; category palette stays multi-hue for data viz)
// ----------------------------------------------------------------------------

function buildCategoryTokens(
	overrides?: Partial<Omit<ThemeCategoryTokens, "fallbacks">>,
): ThemeCategoryTokens {
	const category = {
		cyan: overrides?.cyan ?? colors.cyan[500],
		indigo: overrides?.indigo ?? colors.indigo[500],
		red: overrides?.red ?? colors.red[500],
		green: overrides?.green ?? colors.green[500],
		rose: overrides?.rose ?? colors.rose[500],
		purple: overrides?.purple ?? colors.fuchsia[500],
		blue: overrides?.blue ?? colors.blue[500],
		brown: overrides?.brown ?? colors.stone[500],
		orange: overrides?.orange ?? colors.amber[500],
	};

	return {
		...category,
		fallbacks: [
			category.cyan,
			category.indigo,
			category.red,
			category.green,
			category.rose,
			category.purple,
			category.blue,
			category.brown,
			category.orange,
			colors.teal[500],
			colors.slate[500],
			colors.pink[500],
		] as const,
	};
}

function createNavigationTokens(
	primitives: ThemePrimitiveTokens,
): ThemeNavigationTokens {
	return {
		background: `hsl(${primitives.background})`,
		border: `hsl(${primitives.border})`,
		card: `hsl(${primitives.card})`,
		notification: `hsl(${primitives.destructive})`,
		primary: `hsl(${primitives.primary})`,
		text: `hsl(${primitives.foreground})`,
	};
}

/**
 * Blue-density / "tonal blue" surfaces — the deep-hero → mid → pale → faint
 * ramp seen in the home screen. ONE hue (the brand blue) used at many depths
 * as covers/backgrounds, each paired with an `on*` text/icon color that meets
 * WCAG AA. Use these for hero banners, promo/offer cards, info strips, and
 * icon chips instead of hand-picking blues per screen.
 *
 *   heroStart/Mid/End  deep gradient for the hero / feature banner (white text)
 *   surfaceStrong      saturated mid-blue card        (+ onStrong text)
 *   surfaceSoft        pale blue card / info strip     (+ onSoft text)
 *   surfaceFaint       faintest blue page/section bg   (+ onSoft text)
 *   chip / onChip      icon-chip background + icon/glyph color
 */

function buildTintLight(): ThemeTint {
	return {
		heroStart: hex(blue[600]), // True Blue
		heroMid: hex(blue[700]),
		heroEnd: hex(blue[800]), // toward Bentonville — deep, like the screenshot
		onHero: white,
		surfaceStrong: hex(blue[200]),
		onStrong: hex(blue[900]),
		surfaceSoft: hex(blue[100]),
		onSoft: hex(blue[800]),
		surfaceFaint: hex(blue[50]),
		chip: hex(blue[100]),
		onChip: hex(blue[700]),
	};
}

function buildTintDark(): ThemeTint {
	return {
		heroStart: hex(blue[700]),
		heroMid: hex(blue[800]),
		heroEnd: hex(blue[900]), // Bentonville anchor
		onHero: white,
		surfaceStrong: hex(blue[900]),
		onStrong: hex(blue[100]),
		surfaceSoft: hex(blue[950]),
		onSoft: hex(blue[200]),
		surfaceFaint: hex(blue[950]),
		chip: hex(blue[900]),
		onChip: hex(blue[300]),
	};
}

// ----------------------------------------------------------------------------
// PRIMITIVES — derived from the scales above (no more magic HSL strings)
// ----------------------------------------------------------------------------

const lightPrimitives: ThemePrimitiveTokens = {
	// DEFAULT LIGHT (Google-neutral text). Soft-gray page canvas (#f5f5f5) with
	// WHITE cards above it; wells a touch darker. No card outlines.
	// The "white" theme below swaps only these surfaces. Revert: COLOR-MIGRATION.md.
	background: tok([0, 0, 96]), // #f5f5f5 — soft-gray page canvas
	foreground: tok([0, 0, 6]), // #0f0f0f — Google primary text
	card: tok([0, 0, 100]), // #ffffff — white cards above the gray page (no outline)
	cardForeground: tok([0, 0, 6]),
	popover: tok([0, 0, 100]),
	popoverForeground: tok([0, 0, 6]),
	primary: tok(blue[600]), // brand True Blue — unchanged
	primaryForeground: tok([0, 0, 100]),
	secondary: tok([0, 0, 93]), // #ececec — inset wells / chips
	secondaryForeground: tok([0, 0, 6]),
	muted: tok([0, 0, 93]), // #ececec
	mutedForeground: tok([0, 0, 38]), // #606060 — secondary text
	accent: tok([0, 0, 93]), // #ececec
	accentForeground: tok([0, 0, 6]),
	destructive: tok(red[600]),
	border: tok([0, 0, 90]), // #e5e5e5 — hairline
	input: tok([0, 0, 90]), // #e5e5e5
	ring: tok(blue[500]), // brand — unchanged
	radius: "0.625rem",
	chart1: tok(blue[500]),
	chart2: tok(teal[500]),
	chart3: tok(green[500]),
	chart4: tok(amber[400]),
	chart5: tok(neutral[500]),
};

// "WHITE" theme primitives — derived from light; only the surfaces swap to the
// white-page / gray-card model. Text, brand, borders, charts are all shared.
const whitePrimitives: ThemePrimitiveTokens = {
	...lightPrimitives,
	background: tok([0, 0, 100]), // #ffffff — white page
	card: tok([0, 0, 95]), // #f2f2f2 — gray cards
	secondary: tok([0, 0, 91]), // #e8e8e8 — wells (darker than the gray cards)
	muted: tok([0, 0, 91]),
	accent: tok([0, 0, 91]),
};

const darkPrimitives: ThemePrimitiveTokens = {
	background: tok(neutral[950]),
	foreground: tok(neutral[50]),
	card: tok(neutral[850]),
	cardForeground: tok(neutral[50]),
	popover: tok(neutral[800]),
	popoverForeground: tok(neutral[50]),
	// Dark primary = deep hero blue (blue[700]) for crisp white-on-blue on buttons/
	// headers/active tabs. Was blue[500]. Revert: themes/DARK-PRIMARY.md.
	primary: tok(blue[700]),
	primaryForeground: tok([0, 0, 100]),
	secondary: tok(neutral[800]),
	secondaryForeground: tok(neutral[50]),
	muted: tok(neutral[800]),
	mutedForeground: tok(neutral[400]),
	accent: tok(neutral[800]),
	accentForeground: tok(neutral[50]),
	destructive: tok(red[600]),
	border: tok(neutral[700]),
	input: tok(neutral[700]),
	ring: tok(blue[400]),
	radius: "0.625rem",
	chart1: tok(blue[400]),
	chart2: tok(teal[400]),
	chart3: tok(green[400]),
	chart4: tok(amber[400]),
	chart5: tok(neutral[400]),
};

// forest stays an unchanged easter egg (its own literal values).
const forestPrimitives: ThemePrimitiveTokens = {
	background: "156 34% 9%",
	foreground: "138 43% 96%",
	card: "154 31% 12%",
	cardForeground: "138 43% 96%",
	popover: "154 31% 12%",
	popoverForeground: "138 43% 96%",
	primary: "160 84% 39%",
	primaryForeground: "155 40% 96%",
	secondary: "156 22% 18%",
	secondaryForeground: "138 43% 96%",
	muted: "156 22% 18%",
	mutedForeground: "145 18% 72%",
	accent: "156 22% 18%",
	accentForeground: "138 43% 96%",
	destructive: "0 63% 60%",
	border: "156 20% 24%",
	input: "156 20% 24%",
	ring: "160 84% 39%",
	radius: "0.625rem",
	chart1: "160 70% 42%",
	chart2: "189 70% 42%",
	chart3: "43 74% 66%",
	chart4: "27 87% 67%",
	chart5: "340 75% 55%",
};

const lightTheme: ThemeTokens = {
	id: "light",
	appearance: "light",
	primary: hex(blue[600]),
	primaryLight: hex(blue[50]),
	primaryDark: hex(blue[700]),
	onPrimaryHeader: white,
	// GOOGLE-NEUTRAL LIGHT text (de-blued). Revert: themes/COLOR-MIGRATION.md.
	textPrimary: "#0f0f0f",
	textSecondary: "#606060",
	textMuted: "#909090",
	textContrast: "#0f0f0f",
	textCalendar: "#0f0f0f",
	borderDefault: "#e5e5e5",
	borderChip: "#e5e5e5",
	success: hex(green[600]),
	successAlt: hex(green[500]), // alias of success
	danger: hex(red[500]),
	dangerLight: hex(red[50]),
	dangerSoft: hex(red[100]),
	warning: hex(amber[500]), // functional
	warningLight: hex(amber[100]),
	surfaceBase: pageGray, // #f5f5f5 — soft-gray page canvas
	surfaceElevated: white, // #ffffff — white cards (no outline)
	surfaceMuted: "#ececec", // wells / chips / muted rows
	surfaceOnPrimary: white,
	ratingDefault: hex(amber[400]), // functional (stars)
	ratingLight: hex(amber[200]),
	statusAvailable: hex(green[100]),
	statusOnline: hex(green[500]),
	statusUnavailable: hex(amber[500]), // functional
	statusUnavailableBg: hex(amber[100]),
	orderBg: hex(blue[50]),
	orderText: hex(blue[700]),
	accentCyan: hex(teal[500]),
	accentPurple: hex(teal[600]), // alias (purple removed)
	accentSky: hex(sky[500]), // Walmart Everyday Blue
	roleUser: hex(blue[100]),
	roleTech: hex(blue[600]),
	roleAccent: hex(blue[500]),
	roleLabel: hex(blue[800]),
	overlayWhite: "rgba(255,255,255,0.18)",
	overlayMd: "rgba(255,255,255,0.2)",
	overlaySm: "rgba(255,255,255,0.15)",
	overlaySub: "rgba(255,255,255,0.55)",
	overlayDim: "rgba(255,255,255,0.4)",
	overlayBright: "rgba(255,255,255,0.7)",
	backdrop: "rgba(0,0,0,0.45)",
	gradientStart: hex(blue[50]),
	gradientMid: hex(blue[100]),
	gradientEnd: hex(blue[50]),
	gradientRoleStart: hex(blue[50]),
	gradientRoleMid: hex(blue[100]),
	gradientRoleEnd: hex(blue[50]),
	shadow: "#000000",
	disabledText: "#c4c4c4",
	socialIcon: "#606060",
	category: buildCategoryTokens(),
	primitives: lightPrimitives,
	navigation: createNavigationTokens(lightPrimitives),
	tint: buildTintLight(),
	statusBarStyle: "dark",
	androidNavigationBarStyle: "light",
};

// "WHITE" theme — white page + gray (#f2f2f2) cards. Spreads the default light
// theme and overrides ONLY the surface tokens (this is the single source: the two
// light themes differ by ~6 values, nothing else).
const whiteTheme: ThemeTokens = {
	...lightTheme,
	id: "white",
	surfaceBase: white, // #ffffff — white page
	surfaceElevated: cardSurface, // #f2f2f2 — gray cards
	surfaceMuted: "#e8e8e8", // wells
	primitives: whitePrimitives,
	navigation: createNavigationTokens(whitePrimitives),
};

export const themeRegistry: Record<ThemeId, ThemeTokens> = {
	light: lightTheme,
	white: whiteTheme,
	dark: {
		id: "dark",
		appearance: "dark",
		// Deep hero blue (blue[700]); was blue[500]. Revert: themes/DARK-PRIMARY.md.
		primary: hex(blue[700]),
		primaryLight: hex(blue[950]),
		primaryDark: hex(blue[700]),
		onPrimaryHeader: white,
		textPrimary: hex(neutral[50]),
		textSecondary: hex(neutral[300]),
		textMuted: hex(neutral[400]),
		textContrast: hex(neutral[50]),
		textCalendar: hex(neutral[50]),
		borderDefault: hex(neutral[700]),
		borderChip: hex(neutral[700]),
		success: hex(green[400]),
		successAlt: hex(green[300]),
		danger: hex(red[400]),
		dangerLight: hex(red[950]),
		dangerSoft: hex(red[900]),
		warning: hex(amber[400]),
		warningLight: hex(amber[950]),
		surfaceBase: hex(neutral[950]),
		// elevation tier 1 — must stay LIGHTER than `card` (neutral[850]) so elevated
		// controls (search field, secondary badges, avatar fallbacks) lift off cards.
		surfaceElevated: hex(neutral[800]),
		surfaceMuted: hex(neutral[800]),
		surfaceOnPrimary: white,
		ratingDefault: hex(amber[300]),
		ratingLight: hex(amber[200]),
		statusAvailable: hex(green[950]),
		statusOnline: hex(green[400]),
		statusUnavailable: hex(amber[400]),
		statusUnavailableBg: hex(amber[950]),
		orderBg: hex(blue[950]),
		orderText: hex(blue[300]),
		accentCyan: hex(teal[400]),
		accentPurple: hex(teal[400]), // alias
		accentSky: hex(sky[400]), // Walmart Sky/Everyday family
		roleUser: hex(blue[900]),
		roleTech: hex(blue[500]),
		roleAccent: hex(blue[400]),
		roleLabel: hex(blue[200]),
		overlayWhite: "rgba(255,255,255,0.18)",
		overlayMd: "rgba(255,255,255,0.2)",
		overlaySm: "rgba(255,255,255,0.15)",
		overlaySub: "rgba(255,255,255,0.55)",
		overlayDim: "rgba(255,255,255,0.4)",
		overlayBright: "rgba(255,255,255,0.7)",
		backdrop: "rgba(0,0,0,0.6)",
		gradientStart: hex(neutral[950]),
		gradientMid: hex(neutral[850]),
		gradientEnd: hex(neutral[950]),
		gradientRoleStart: hex(blue[950]),
		gradientRoleMid: hex(neutral[850]),
		gradientRoleEnd: hex(blue[950]),
		shadow: "#000000",
		disabledText: hex(neutral[600]),
		socialIcon: hex(neutral[300]),
		category: buildCategoryTokens({
			cyan: colors.cyan[400],
			indigo: colors.indigo[400],
			red: colors.red[400],
			green: colors.green[400],
			rose: colors.rose[400],
			purple: colors.fuchsia[400],
			blue: colors.blue[400],
			brown: colors.stone[400],
			orange: colors.amber[400],
		}),
		primitives: darkPrimitives,
		navigation: createNavigationTokens(darkPrimitives),
		tint: buildTintDark(),
		statusBarStyle: "light",
		androidNavigationBarStyle: "dark",
	},
	forest: {
		id: "forest",
		appearance: "dark",
		primary: colors.emerald[500],
		primaryLight: "#123524",
		primaryDark: colors.emerald[700],
		onPrimaryHeader: colors.white,
		textPrimary: colors.emerald[50],
		textSecondary: "#c9dfd0",
		textMuted: "#a8c3b2",
		textContrast: colors.emerald[50],
		textCalendar: colors.emerald[50],
		borderDefault: "#274536",
		borderChip: "#274536",
		success: colors.green[400],
		successAlt: colors.emerald[300],
		danger: colors.red[400],
		dangerLight: "#3d1b1b",
		dangerSoft: "#4a2020",
		warning: colors.amber[400],
		warningLight: "#3f3316",
		surfaceBase: "#0e1f16",
		surfaceElevated: "#163127",
		surfaceMuted: "#bad2c3",
		surfaceOnPrimary: colors.white,
		ratingDefault: colors.lime[400],
		ratingLight: colors.lime[300],
		statusAvailable: "#173826",
		statusOnline: colors.emerald[400],
		statusUnavailable: colors.orange[400],
		statusUnavailableBg: "#4b2e10",
		orderBg: "#0d2c19",
		orderText: colors.emerald[300],
		accentCyan: colors.teal[400],
		accentPurple: colors.green[400],
		accentSky: colors.emerald[300],
		roleUser: "#1f4a39",
		roleTech: colors.emerald[500],
		roleAccent: colors.emerald[400],
		roleLabel: colors.emerald[100],
		overlayWhite: "rgba(255,255,255,0.18)",
		overlayMd: "rgba(255,255,255,0.2)",
		overlaySm: "rgba(255,255,255,0.15)",
		overlaySub: "rgba(255,255,255,0.55)",
		overlayDim: "rgba(255,255,255,0.4)",
		overlayBright: "rgba(255,255,255,0.7)",
		backdrop: "rgba(0,0,0,0.55)",
		gradientStart: "#0d2419",
		gradientMid: "#173628",
		gradientEnd: "#0d2419",
		gradientRoleStart: "#11291d",
		gradientRoleMid: "#183629",
		gradientRoleEnd: "#11291d",
		shadow: colors.black,
		disabledText: "#5f7c69",
		socialIcon: "#c0d7c8",
		category: buildCategoryTokens({
			cyan: colors.teal[400],
			indigo: colors.emerald[400],
			red: colors.red[400],
			green: colors.green[400],
			rose: colors.lime[400],
			purple: colors.emerald[300],
			blue: colors.teal[300],
			brown: colors.stone[400],
			orange: colors.amber[400],
		}),
		primitives: forestPrimitives,
		navigation: createNavigationTokens(forestPrimitives),
		tint: {
			heroStart: colors.emerald[600],
			heroMid: colors.emerald[700],
			heroEnd: colors.emerald[900],
			onHero: colors.white,
			surfaceStrong: "#16412e",
			onStrong: colors.emerald[100],
			surfaceSoft: "#11291d",
			onSoft: colors.emerald[200],
			surfaceFaint: "#0e1f16",
			chip: "#16412e",
			onChip: colors.emerald[300],
		},
		statusBarStyle: "light",
		androidNavigationBarStyle: "dark",
	},
};

export const themeIds = Object.keys(themeRegistry) as ThemeId[];
export const defaultThemeId: ThemeId = "light";
