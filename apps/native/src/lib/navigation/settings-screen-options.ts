/**
 * Shared header chrome for the user + technician settings stacks. Both stacks
 * paint the same surface-base header; only their screen lists differ, so the
 * per-screen `options` shape lives here too to keep the route files thin.
 */

interface SettingsStackColors {
	readonly surfaceBase: string;
	readonly textPrimary: string;
}

/** Stack-level `screenOptions` — flat surface header, no shadow. */
export function buildSettingsStackOptions(colors: SettingsStackColors) {
	return {
		contentStyle: { backgroundColor: colors.surfaceBase },
		headerShadowVisible: false,
		headerStyle: { backgroundColor: colors.surfaceBase },
		headerTintColor: colors.textPrimary,
	} as const;
}

/** Per-screen `options` for a titled settings sub-screen with a back label. */
export function settingsScreenOptions(title: string, backTitle: string) {
	return {
		title,
		headerShown: true,
		headerBackTitle: backTitle,
	} as const;
}
