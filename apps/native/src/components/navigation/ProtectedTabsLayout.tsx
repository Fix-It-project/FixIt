import { Redirect, Tabs, type Href } from "expo-router";
import { useMemo, type PropsWithChildren, type ReactNode } from "react";
import { View } from "react-native";
import {
  getBaseTabScreenOptions,
  useBottomTabMetrics,
} from "@/src/lib/tab-bar-config";
import { useThemeColors } from "@/src/lib/theme";
import { useAuthStore, type UserType } from "@/src/stores/auth-store";

export interface ProtectedTabsLayoutProps extends PropsWithChildren {
  readonly allowedUserType: UserType;
  readonly unauthenticatedRedirect: Href;
  readonly wrongRoleRedirect: Href;
  readonly overlay?: ReactNode;
}

export function ProtectedTabsLayout({
  allowedUserType,
  unauthenticatedRedirect,
  wrongRoleRedirect,
  overlay,
  children,
}: Readonly<ProtectedTabsLayoutProps>) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const userType = useAuthStore((state) => state.userType);
  const themeColors = useThemeColors();
  const metrics = useBottomTabMetrics();

  const screenOptions = useMemo(
    () => getBaseTabScreenOptions(themeColors, metrics),
    [
      metrics.bottomInset,
      metrics.tabBarHeight,
      metrics.tabBarPaddingBottom,
      metrics.tabBarPaddingTop,
      themeColors,
    ],
  );

  if (!isLoading && !isAuthenticated) {
    return <Redirect href={unauthenticatedRedirect} />;
  }

  if (!isLoading && isAuthenticated && userType !== allowedUserType) {
    return <Redirect href={wrongRoleRedirect} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <Tabs screenOptions={screenOptions}>{children}</Tabs>
      {overlay}
    </View>
  );
}
