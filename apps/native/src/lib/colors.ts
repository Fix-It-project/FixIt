/**
 * Single source of truth for all FixIt design tokens.
 *
 * Every color value comes from `tailwindcss/colors` (except rgba overlays).
 * All neutrals use the `slate` family — never gray, neutral, or zinc.
 *
 * `tailwind.config.ts` imports and maps these tokens into NativeWind classes.
 * `theme.ts` is intentionally separate (React Navigation light/dark HSL).
 */

import colors from "tailwindcss/colors";

export const Colors = {
  // ─── Primary ────────────────────────────────────────────
  primary:      colors.blue[600],   // buttons, focused inputs, links
  primaryLight: colors.indigo[50],  // light bg (KeyboardWrapper, info toast)
  primaryDark:  colors.blue[700],   // get-started logo accent

  // ─── Text ───────────────────────────────────────────────
  textPrimary:   colors.black,       // headings, labels, input text
  textSecondary: colors.slate[600],  // subtitles, descriptions
  textMuted:     colors.slate[600],  // placeholders, icons
  textContrast:  colors.slate[900],  // high-contrast dark text
  textCalendar:  colors.slate[900],  // calendar day text

  // ─── Border ─────────────────────────────────────────────
  borderDefault: colors.slate[300],  // dividers, separators
  borderChip:    colors.violet[50],  // category chip unselected border

  // ─── Feedback ───────────────────────────────────────────
  success:    colors.emerald[500],   // toast checkmark, positive actions
  successAlt: colors.green[500],     // document upload check
  danger:     colors.red[500],       // error toast, alert icon
  dangerLight: colors.red[50],       // error background tint
  dangerSoft: colors.red[100],       // status badge background
  warning:    colors.amber[600],     // warning banner icon
  warningLight: colors.amber[100],   // warning badge background

  // ─── Surface ───────────────────────────────────────────
  surfaceBase:     colors.white,      // default background
  surfaceElevated: colors.slate[100], // upload icon bg, card bg
  surfaceMuted:    colors.slate[500], // secondary icon colour

  // ─── Rating ─────────────────────────────────────────────
  ratingDefault: colors.amber[500],  // star rating
  ratingLight:   colors.amber[200],  // star accent on dark backgrounds

  // ─── Status ─────────────────────────────────────────────
  statusAvailable:     colors.emerald[100], // light green badge bg
  statusOnline:        colors.green[300],   // technician online badge
  statusUnavailable:   colors.orange[600],  // unavailable label + border
  statusUnavailableBg: colors.orange[100],  // unavailable button bg

  // ─── Order ──────────────────────────────────────────────
  orderBg:   colors.green[50],  // orders panel background
  orderText: colors.green[700], // orders panel text/icon

  // ─── Accent ─────────────────────────────────────────────
  accentCyan:   colors.cyan[500],   // stat card icon
  accentPurple: colors.purple[500], // stat card icon
  accentSky:    colors.sky[300],    // header "IT" wordmark

  // ─── Role ───────────────────────────────────────────────
  roleUser:   colors.blue[100], // user role badge bg
  roleTech:   colors.blue[600], // tech role badge bg
  roleAccent: colors.blue[500], // role selection accent
  roleLabel:  colors.blue[800], // role label text

  // ─── Overlay ────────────────────────────────────────────
  overlayWhite:  "rgba(255,255,255,0.18)" as const,
  overlayMd:     "rgba(255,255,255,0.2)" as const,
  overlaySm:     "rgba(255,255,255,0.15)" as const,
  overlaySub:    "rgba(255,255,255,0.55)" as const,
  overlayDim:    "rgba(255,255,255,0.4)" as const,
  overlayBright: "rgba(255,255,255,0.7)" as const,

  // ─── Gradient ───────────────────────────────────────────
  gradientStart:     colors.indigo[50],
  gradientMid:       colors.indigo[100],
  gradientEnd:       colors.indigo[50],
  gradientRoleStart: colors.blue[50],
  gradientRoleMid:   colors.indigo[100],
  gradientRoleEnd:   colors.blue[50],

  // ─── Misc ──────────────────────────────────────────────
  shadow:      colors.black,
  disabledText: colors.slate[300], // disabled date text in calendars
  socialIcon:  colors.slate[600],  // social/OAuth icon colour

  // ─── Category ───────────────────────────────────────────
  category: {
    cyan:   colors.cyan[500],    // Air Condition, Fan
    indigo: colors.indigo[500],  // Dish
    red:    colors.red[500],     // Fridge/Freezer
    green:  colors.green[500],   // Home Cleaning
    rose:   colors.rose[500],    // Oven/Cooker
    purple: colors.fuchsia[500], // Painter
    blue:   colors.blue[500],    // Plumbing
    brown:  colors.stone[500],   // Carpenter
    orange: colors.amber[500],   // Electrician
    fallbacks: [
      colors.cyan[500],    colors.indigo[500], colors.red[500],
      colors.green[500],   colors.rose[500],   colors.fuchsia[500],
      colors.blue[500],    colors.stone[500],  colors.amber[500],
      colors.teal[500],    colors.slate[500],  colors.pink[500],
    ],
  },
} as const;

export type AppColors = typeof Colors;
