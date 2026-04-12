import type { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { Platform, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { ThemeColors } from "@/src/lib/theme";

const TAB_BAR_CONTENT_HEIGHT = 52;
const TAB_BAR_TOP_PADDING = 8;
const MIN_TAB_BAR_BOTTOM_PADDING = 12;

const TAB_BAR_LABEL_STYLE = {
  fontSize: 11,
  fontWeight: "600" as const,
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

export function getBaseTabScreenOptions(
  themeColors: ThemeColors,
  metrics: BottomTabMetrics,
): BottomTabNavigationOptions {
  const isIos = Platform.OS === "ios";

  return {
    headerShown: false,
    tabBarActiveTintColor: themeColors.primary,
    tabBarInactiveTintColor: themeColors.textMuted,
    tabBarLabelStyle: TAB_BAR_LABEL_STYLE,
    tabBarStyle: {
      backgroundColor: themeColors.surfaceBase,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: themeColors.borderDefault,
      height: metrics.tabBarHeight,
      paddingTop: metrics.tabBarPaddingTop,
      paddingBottom: metrics.tabBarPaddingBottom,
      elevation: 0,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: isIos ? 0.06 : 0,
      shadowRadius: isIos ? 8 : 0,
    },
  };
}
