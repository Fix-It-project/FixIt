import { type Href, Redirect, Tabs } from "expo-router";
import { type PropsWithChildren, type ReactNode, useMemo } from "react";
import { View } from "react-native";
import { ScreenSafeAreaView } from "@/src/components/layout/ScreenSafeAreaView";
import {
	getBaseTabScreenOptions,
	useBottomTabMetrics,
} from "@/src/lib/tab-bar-config";
import { useThemeColors } from "@/src/lib/theme";
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

	const screenOptions = useMemo(
		() => getBaseTabScreenOptions(themeColors, metrics),
		[metrics, themeColors],
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
