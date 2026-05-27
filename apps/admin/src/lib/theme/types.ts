export type ThemeId = "light" | "dark";
export type ThemePreference = ThemeId | "system";
export type ThemeAppearance = "light" | "dark";

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

export interface ThemePalette {
	primary: string;
	primaryLight: string;
	primaryDark: string;
	textPrimary: string;
	textSecondary: string;
	textMuted: string;
	borderDefault: string;
	surfaceBase: string;
	surfaceElevated: string;
	success: string;
	danger: string;
	warning: string;
}

export interface ThemeTokens extends ThemePalette {
	id: ThemeId;
	appearance: ThemeAppearance;
	primitives: ThemePrimitiveTokens;
}
