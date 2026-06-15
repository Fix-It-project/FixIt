import { type Href, Redirect, Tabs } from "expo-router";
import { type PropsWithChildren, type ReactNode, useMemo } from "react";
import { useWindowDimensions, View } from "react-native";
import { ScreenSafeAreaView } from "@/src/components/layout/ScreenSafeAreaView";
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

	return (
		<ScreenSafeAreaView
			edges={["top"]}
			style={{
				flex: 1,
				backgroundColor:
					topSafeAreaBackgroundColor ?? themeColors.surfaceElevated,
			}}
		>
			<View style={{ flex: 1 }}>
				<Tabs screenOptions={screenOptions}>{children}</Tabs>
				{overlay}
			</View>
		</ScreenSafeAreaView>
	);
}
