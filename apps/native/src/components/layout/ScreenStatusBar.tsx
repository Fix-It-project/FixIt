import { useFocusEffect } from "expo-router/react-navigation";
import { type StatusBarStyle, setStatusBarStyle } from "expo-status-bar";
import { useCallback } from "react";
import { useThemeTokens } from "@/src/constants/design-tokens";

/**
 * Declarative per-screen status-bar chrome. The app is edge-to-edge on Android,
 * so the system status bar is transparent and each screen owns the contrast of
 * its icons. Screens fall into two chrome categories:
 *
 * - `blue`    — the screen paints a blue/hero band behind the status bar
 *               (bg-app-primary / heroStart / primaryDark). Icons must be light.
 * - `surface` — the screen sits on the theme surface; icons follow the theme
 *               (dark in light mode, light in dark mode).
 *
 * Applied on focus and reset to the surface default on blur, so the next screen
 * — even one that declares no variant — never inherits this screen's icons.
 * Only `blue` screens need to render this; everything else is the surface
 * default already set at the root. Reliable under both tab and stack navigators
 * (focus-driven, not mount-order driven).
 */
type ScreenChrome = "blue" | "surface";

export function ScreenStatusBar({
	variant,
}: Readonly<{ variant: ScreenChrome }>) {
	const tokens = useThemeTokens();
	const surfaceStyle = tokens.statusBarStyle as StatusBarStyle;
	const style: StatusBarStyle = variant === "blue" ? "light" : surfaceStyle;

	useFocusEffect(
		useCallback(() => {
			setStatusBarStyle(style);
			return () => setStatusBarStyle(surfaceStyle);
		}, [style, surfaceStyle]),
	);

	return null;
}
