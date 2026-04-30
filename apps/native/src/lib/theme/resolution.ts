import { DarkTheme, DefaultTheme, type Theme } from "@react-navigation/native";
import type { Theme as CalendarTheme } from "react-native-calendars/src/types";
import { fontFamily, fontSize, radius, spacing } from "@/src/lib/design-tokens";
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

export function createNavigationTheme(tokens: ThemeTokens): Theme {
	const baseTheme = tokens.appearance === "dark" ? DarkTheme : DefaultTheme;

	return {
		...baseTheme,
		colors: {
			...baseTheme.colors,
			...tokens.navigation,
		},
	};
}

export function getCalendarTheme(tokens: ThemeTokens): CalendarTheme {
	return {
		backgroundColor: tokens.surfaceBase,
		calendarBackground: tokens.surfaceBase,
		textSectionTitleColor: tokens.textSecondary,
		textSectionTitleDisabledColor: tokens.textMuted,
		selectedDayBackgroundColor: tokens.primary,
		selectedDayTextColor: tokens.surfaceOnPrimary,
		todayTextColor: tokens.primary,
		todayBackgroundColor: tokens.primaryLight,
		dayTextColor: tokens.textCalendar,
		textDisabledColor: tokens.borderDefault,
		textInactiveColor: tokens.textMuted,
		dotColor: tokens.primary,
		selectedDotColor: tokens.surfaceOnPrimary,
		arrowColor: tokens.primary,
		monthTextColor: tokens.textCalendar,
		indicatorColor: tokens.primary,
		textDayFontFamily: fontFamily.regular,
		textMonthFontFamily: fontFamily.bold,
		textDayHeaderFontFamily: fontFamily.medium,
		textDayFontSize: fontSize.sm,
		textMonthFontSize: fontSize.base,
		textDayHeaderFontSize: fontSize.xs,
		stylesheet: {
			calendar: {
				main: {
					backgroundColor: tokens.surfaceBase,
				},
				header: {
					week: {
						marginTop: spacing.stack.sm,
						flexDirection: "row",
						justifyContent: "space-between",
					},
				},
			},
			day: {
				basic: {
					base: {
						width: spacing.control.iconBoxSm.size,
						height: spacing.control.iconBoxSm.size,
						alignItems: "center",
						justifyContent: "center",
						borderRadius: radius.card,
					},
				},
			},
			"calendar-list": {
				main: {
					backgroundColor: tokens.surfaceBase,
				},
			},
		},
	};
}

export function getThemeVariableRecord(
	tokens: ThemeTokens,
): Record<string, string> {
	return {
		"--app-primary": tokens.primary,
		"--app-primary-light": tokens.primaryLight,
		"--app-primary-dark": tokens.primaryDark,
		"--on-primary-header": tokens.onPrimaryHeader,
		"--text-primary": tokens.textPrimary,
		"--text-secondary": tokens.textSecondary,
		"--text-muted": tokens.textMuted,
		"--text-contrast": tokens.textContrast,
		"--text-calendar": tokens.textCalendar,
		"--surface-base": tokens.surfaceBase,
		"--surface-elevated": tokens.surfaceElevated,
		"--surface-muted": tokens.surfaceMuted,
		"--surface-on-primary": tokens.surfaceOnPrimary,
		"--border-default": tokens.borderDefault,
		"--border-chip": tokens.borderChip,
		"--success": tokens.success,
		"--success-alt": tokens.successAlt,
		"--danger": tokens.danger,
		"--danger-light": tokens.dangerLight,
		"--danger-soft": tokens.dangerSoft,
		"--warning": tokens.warning,
		"--warning-light": tokens.warningLight,
		"--rating-default": tokens.ratingDefault,
		"--rating-light": tokens.ratingLight,
		"--status-available": tokens.statusAvailable,
		"--status-online": tokens.statusOnline,
		"--status-unavailable": tokens.statusUnavailable,
		"--status-unavailable-bg": tokens.statusUnavailableBg,
		"--order-bg": tokens.orderBg,
		"--order-text": tokens.orderText,
		"--accent-cyan": tokens.accentCyan,
		"--accent-purple": tokens.accentPurple,
		"--accent-sky": tokens.accentSky,
		"--role-user": tokens.roleUser,
		"--role-tech": tokens.roleTech,
		"--role-accent": tokens.roleAccent,
		"--role-label": tokens.roleLabel,
		"--overlay-white": tokens.overlayWhite,
		"--overlay-md": tokens.overlayMd,
		"--overlay-sm": tokens.overlaySm,
		"--overlay-sub": tokens.overlaySub,
		"--overlay-dim": tokens.overlayDim,
		"--overlay-bright": tokens.overlayBright,
		"--backdrop": tokens.backdrop,
		"--gradient-start": tokens.gradientStart,
		"--gradient-mid": tokens.gradientMid,
		"--gradient-end": tokens.gradientEnd,
		"--gradient-role-start": tokens.gradientRoleStart,
		"--gradient-role-mid": tokens.gradientRoleMid,
		"--gradient-role-end": tokens.gradientRoleEnd,
		"--shadow": tokens.shadow,
		"--disabled-text": tokens.disabledText,
		"--social-icon": tokens.socialIcon,
		"--category-cyan": tokens.category.cyan,
		"--category-indigo": tokens.category.indigo,
		"--category-red": tokens.category.red,
		"--category-green": tokens.category.green,
		"--category-rose": tokens.category.rose,
		"--category-purple": tokens.category.purple,
		"--category-blue": tokens.category.blue,
		"--category-brown": tokens.category.brown,
		"--category-orange": tokens.category.orange,
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
