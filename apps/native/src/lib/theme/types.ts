export type ThemeId = "light" | "dark" | "forest";
export type ThemePreference = ThemeId | "system";
export type ThemeAppearance = "light" | "dark";

export interface ThemeCategoryTokens {
  cyan: string;
  indigo: string;
  red: string;
  green: string;
  rose: string;
  purple: string;
  blue: string;
  brown: string;
  orange: string;
  fallbacks: readonly string[];
}

export interface ThemePrimitiveTokens {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  border: string;
  input: string;
  ring: string;
  radius: string;
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
}

export interface ThemeNavigationTokens {
  background: string;
  border: string;
  card: string;
  notification: string;
  primary: string;
  text: string;
}

export interface ThemePalette {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  onPrimaryHeader: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textContrast: string;
  textCalendar: string;
  borderDefault: string;
  borderChip: string;
  success: string;
  successAlt: string;
  danger: string;
  dangerLight: string;
  dangerSoft: string;
  warning: string;
  warningLight: string;
  surfaceBase: string;
  surfaceElevated: string;
  surfaceMuted: string;
  surfaceOnPrimary: string;
  ratingDefault: string;
  ratingLight: string;
  statusAvailable: string;
  statusOnline: string;
  statusUnavailable: string;
  statusUnavailableBg: string;
  orderBg: string;
  orderText: string;
  accentCyan: string;
  accentPurple: string;
  accentSky: string;
  roleUser: string;
  roleTech: string;
  roleAccent: string;
  roleLabel: string;
  overlayWhite: string;
  overlayMd: string;
  overlaySm: string;
  overlaySub: string;
  overlayDim: string;
  overlayBright: string;
  gradientStart: string;
  gradientMid: string;
  gradientEnd: string;
  gradientRoleStart: string;
  gradientRoleMid: string;
  gradientRoleEnd: string;
  shadow: string;
  disabledText: string;
  socialIcon: string;
  category: ThemeCategoryTokens;
}

export interface ThemeTokens extends ThemePalette {
  id: ThemeId;
  appearance: ThemeAppearance;
  primitives: ThemePrimitiveTokens;
  navigation: ThemeNavigationTokens;
  statusBarStyle: "light" | "dark";
  androidNavigationBarStyle: "light" | "dark";
}

/** @deprecated Use ThemePalette instead */
export type ThemeColors = ThemePalette;
