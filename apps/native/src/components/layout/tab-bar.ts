import type { BottomTabNavigationOptions } from "expo-router/js-tabs";
import { Platform, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
	fontFamily,
	spacing,
	type ThemePalette,
} from "@/src/constants/design-tokens";

const TAB_BAR_CONTENT_HEIGHT = spacing.tabBar.height - 20;
const TAB_BAR_TOP_PADDING = spacing.stack.sm;
const MIN_TAB_BAR_BOTTOM_PADDING = spacing.stack.md;

const TAB_BAR_LABEL_STYLE = {
	fontFamily: fontFamily.bold,
	fontSize: 11,
	marginTop: 2,
} as const;

export interface BottomTabMetrics {
	bottomInset: number;
	tabBarHeight: number;
	tabBarPaddingBottom: number;
	tabBarPaddingTop: number;
}

export function useBottomTabMetrics(): BottomTabMetrics {
	const { bottom } = useSafeAreaInsets();

	const tabBarPaddingBottom = Math.max(bottom, MIN_TAB_BAR_BOTTOM_PADDING);
	const tabBarPaddingTop = TAB_BAR_TOP_PADDING;
	const tabBarHeight =
		TAB_BAR_CONTENT_HEIGHT + tabBarPaddingTop + tabBarPaddingBottom;

	return {
		bottomInset: bottom,
		tabBarHeight,
		tabBarPaddingBottom,
		tabBarPaddingTop,
	};
}

export const NARROW_TAB_BAR_WIDTH = 360;
// Below this viewport height (e.g. vertical split-screen) labels are hidden too, so
// they never reflow beside the icons on a short bar.
export const NARROW_TAB_BAR_HEIGHT = 480;

export function getBaseTabScreenOptions(
	themeColors: ThemePalette,
	metrics: BottomTabMetrics,
	options: { showLabels?: boolean } = {},
): BottomTabNavigationOptions {
	const isIos = Platform.OS === "ios";
	const showLabels = options.showLabels ?? true;

	return {
		headerShown: false,
		tabBarActiveTintColor: themeColors.primary,
		tabBarInactiveTintColor: themeColors.textPrimary,
		tabBarShowLabel: showLabels,
		// Force labels under the icon — never beside it (RN defaults to beside-icon on
		// short/wide bars, which is what mangled the layout in split-screen).
		tabBarLabelPosition: "below-icon",
		tabBarLabelStyle: TAB_BAR_LABEL_STYLE,
		tabBarStyle: {
			backgroundColor: themeColors.surfaceBase,
			borderTopWidth: StyleSheet.hairlineWidth,
			borderTopColor: themeColors.borderDefault,
			height: metrics.tabBarHeight,
			paddingTop: metrics.tabBarPaddingTop,
			paddingBottom: metrics.tabBarPaddingBottom,
			elevation: 0,
			shadowColor: themeColors.shadow,
			shadowOffset: { width: 0, height: -2 },
			shadowOpacity: isIos ? 0.06 : 0,
			shadowRadius: isIos ? 8 : 0,
		},
	};
}
