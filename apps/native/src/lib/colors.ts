/**
 * Centralized color palette for the FixIt app.
 *
 * Import `Colors` wherever you need a color value instead of
 * hard-coding hex strings.  To retheme the app, change the
 * values here and every screen updates automatically.
 *
 * NOTE: `theme.ts` is intentionally kept separate — it
 * provides React Navigation theme tokens (light/dark HSL).
 */

export const Colors = {
  // ─── Brand ──────────────────────────────────────────────
  brand: "#036ded", // primary blue  (buttons, focused inputs, links)
  brandLight: "#ebeeff", // light-blue bg (KeyboardWrapper, info toast)
  brandAlt: "#0066FF", // shadow colour, role-selection accent
  brandDark: "#135bec", // get-started logo accent

  // ─── Text ───────────────────────────────────────────────
  textPrimary: "#000000", // headings, labels, input text (like Uber titles)
  textSecondary: "#555555", // subtitles, secondary text (like Uber descriptions)
  textMuted: "#555555", // placeholderTextColor, icons

  // ─── Borders ────────────────────────────────────────────
  borderLight: "#d1d5dc", // dividers (OAuth separator)
  borderChip: "#ede8f3", // category chip unselected border

  // ─── Feedback ───────────────────────────────────────────
  success: "#10b981", // toast checkmark green
  successAlt: "#22c55e", // document upload check
  error: "#ef4444", // error toast / alert icon
  warning: "#d97706", // error banner icon

  // ─── Surface / Background ──────────────────────────────
  white: "#ffffff",
  surfaceGray: "#f3f4f6", // upload icon background
  surfaceMuted: "#6a7282", // secondary icon colour / muted text

  // ─── Surface / Background (extended) ────────────────────
  surfaceLight: "#f0f1f3",  // category card bg, light surface backgrounds

  // ─── Misc ─────────────────────────────────────────────────
  star: "#F59E0B",          // amber star for ratings
  starLight: "#fde68a",     // star accent on dark backgrounds
  availableBg: "#d1fae5",   // light green badge background
  whiteOverlay: "rgba(255,255,255,0.18)", // translucent white for button overlays
  shadow: "#000000",        // shadow color
  cyan: "#06b6d4",          // stat card icon background
  purple: "#a855f7",        // stat card icon background
  darkText: "#141118",      // dark text for contrast (reorder button etc.)
  dayText: "#111827",       // calendar day text

  // ─── Feedback (extended) ──────────────────────────────────
  errorToast: "#D9534F",    // toast error background
  disabledCalText: "#D1D5DB", // disabled date text in calendars

  // ─── Schedule availability states ────────────────────────
  unavailableOrange: "#E65100",    // override/unavailable label + border
  unavailableOrangeBg: "#FFF3E0",  // override button background
  orderGreenBg: "#F0FDF4",         // orders panel background
  orderGreenDark: "#15803D",       // orders panel text/icon

  // ─── Technician status / header overlays ─────────────────
  brandAccentText: "#7dd3fc", // sky-blue accent for header "IT" wordmark
  onlineGreen: "#86efac",    // soft green for technician online badge
  overlayMd: "rgba(255,255,255,0.2)",  // icon button backgrounds on dark header
  overlaySm: "rgba(255,255,255,0.15)", // toggle pill background on dark header
  overlaySub: "rgba(255,255,255,0.55)", // inactive toggle tab text
  overlayDim: "rgba(255,255,255,0.4)", // swipe dot inactive
  overlayBright: "rgba(255,255,255,0.7)", // swipe dot active

  // ─── Gradients (get-started / role-selection) ───────────
  gradientStart: "#ecefff",
  gradientMid: "#dbe2ff",
  gradientEnd: "#ecefff",
  gradientRoleStart: "#f0f4ff",
  gradientRoleMid: "#dbe2ff",
  gradientRoleEnd: "#f0f5ff",

  // ─── Category icon colors ────────────────────────────────
  category: {
    cyan:   "#00BCD4", // Air Condition, Fan
    indigo: "#5C6BC0", // Dish
    red:    "#EF5350", // Fridge/Freezer
    green:  "#4CAF50", // Home Cleaning
    rose:   "#F44336", // Oven/Cooker
    purple: "#9C27B0", // Painter
    blue:   "#2196F3", // Plumbing
    brown:  "#795548", // Carpenter
    orange: "#FF9800", // Electrician
    // Fallback palette (in order) for categories without a mapped icon
    fallbacks: [
      "#00BCD4", "#5C6BC0", "#EF5350", "#4CAF50",
      "#F44336", "#9C27B0", "#2196F3", "#795548",
      "#FF9800", "#009688", "#607D8B", "#E91E63",
    ],
  },
} as const;
