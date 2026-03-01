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

  // ─── Gradients (get-started / role-selection) ───────────
  gradientStart: "#ecefff",
  gradientMid: "#dbe2ff",
  gradientEnd: "#ecefff",
  gradientRoleStart: "#f0f4ff",
  gradientRoleMid: "#dbe2ff",
  gradientRoleEnd: "#f0f5ff",
} as const;
