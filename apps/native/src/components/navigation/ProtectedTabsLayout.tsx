import { type Href, Redirect, Tabs } from "expo-router";
import { type PropsWithChildren, type ReactNode, useMemo } from "react";
import { useWindowDimensions, View } from "react-native";
import { ScreenSafeAreaView } from "@/src/components/layout/ScreenSafeAreaView";
import { useScreenChromeStore } from "@/src/components/layout/screen-chrome-store";
import {
	getBaseTabScreenOptions,
	NARROW_TAB_BAR_HEIGHT,
	NARROW_TAB_BAR_WIDTH,
	useBottomTabMetrics,
} from "@/src/components/layout/tab-bar";
import { useThemeColors } from "@/src/constants/design-tokens";
import { type UserType, useAuthStore } from "@/src/stores/auth-store";

export interface ProtectedTabsLayoutProps extends PropsWithChildren {
	readonly allowedUserType: UserType;
	readonly unauthenticatedRedirect: Href;
	readonly wrongRoleRedirect: Href;
	readonly overlay?: ReactNode;
	readonly topSafeAreaBackgroundColor?: string;
}

export function ProtectedTabsLayout({
	allowedUserType,
	unauthenticatedRedirect,
	wrongRoleRedirect,
	overlay,
	topSafeAreaBackgroundColor,
	children,
}: Readonly<ProtectedTabsLayoutProps>) {
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const isLoading = useAuthStore((state) => state.isLoading);
	const userType = useAuthStore((state) => state.userType);
	const themeColors = useThemeColors();
	const metrics = useBottomTabMetrics();
	const topVariant = useScreenChromeStore((s) => s.topVariant);
	const { width, height } = useWindowDimensions();
	const showLabels =
		width >= NARROW_TAB_BAR_WIDTH && height >= NARROW_TAB_BAR_HEIGHT;

	const screenOptions = useMemo(
		() => getBaseTabScreenOptions(themeColors, metrics, { showLabels }),
		[metrics, themeColors, showLabels],
	);

	if (!isLoading && !isAuthenticated) {
		return <Redirect href={unauthenticatedRedirect} />;
	}

	if (!isLoading && isAuthenticated && userType !== allowedUserType) {
		return <Redirect href={wrongRoleRedirect} />;
	}

	// The top inset blends with the focused screen: each screen publishes a
	// chrome variant (via ScreenStatusBar) which we resolve to a live theme color
	// here, so it re-renders correctly across light/dark. An explicit prop still
	// wins, for any caller that wants to pin the color.
	const topInsetColor =
		topSafeAreaBackgroundColor ??
		(topVariant === "blue" ? themeColors.primaryDark : themeColors.surfaceBase);

	return (
		<ScreenSafeAreaView
			edges={["top"]}
			style={{
				flex: 1,
				backgroundColor: topInsetColor,
			}}
		>
			<View style={{ flex: 1 }}>
				<Tabs screenOptions={screenOptions}>{children}</Tabs>
				{overlay}
			</View>
		</ScreenSafeAreaView>
	);
}
