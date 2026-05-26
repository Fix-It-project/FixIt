import { themeRegistry } from "./definitions";
import type { ThemeId, ThemePreference, ThemeTokens } from "./types";

export function resolveThemeId(
	preference: ThemePreference,
	systemColorScheme?: "light" | "dark" | null,
): ThemeId {
	if (preference === "system") {
		return systemColorScheme === "dark" ? "dark" : "light";
	}
	return preference;
}

export function getThemeTokens(themeId: ThemeId): ThemeTokens {
	return themeRegistry[themeId];
}

export function getSystemColorScheme(): "light" | "dark" {
	if (typeof window === "undefined") return "light";
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}

export function getThemeVariableRecord(
	tokens: ThemeTokens,
): Record<string, string> {
	return {
		"--background": tokens.primitives.background,
		"--foreground": tokens.primitives.foreground,
		"--card": tokens.primitives.card,
		"--card-foreground": tokens.primitives.cardForeground,
		"--popover": tokens.primitives.popover,
		"--popover-foreground": tokens.primitives.popoverForeground,
		"--primary": tokens.primitives.primary,
		"--primary-foreground": tokens.primitives.primaryForeground,
		"--secondary": tokens.primitives.secondary,
		"--secondary-foreground": tokens.primitives.secondaryForeground,
		"--muted": tokens.primitives.muted,
		"--muted-foreground": tokens.primitives.mutedForeground,
		"--accent": tokens.primitives.accent,
		"--accent-foreground": tokens.primitives.accentForeground,
		"--destructive": tokens.primitives.destructive,
		"--border": tokens.primitives.border,
		"--input": tokens.primitives.input,
		"--ring": tokens.primitives.ring,
		"--radius": tokens.primitives.radius,
		"--chart-1": tokens.primitives.chart1,
		"--chart-2": tokens.primitives.chart2,
		"--chart-3": tokens.primitives.chart3,
		"--chart-4": tokens.primitives.chart4,
		"--chart-5": tokens.primitives.chart5,
	};
}
