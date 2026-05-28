import { type Href, Redirect, Stack } from "expo-router";
import type { ReactNode } from "react";
import { View } from "react-native";
import { ROUTES } from "@/src/lib/navigation";
import { type UserType, useAuthStore } from "@/src/stores/auth-store";

interface RoleProtectedLayoutProps {
	requiredRole: UserType;
	otherRoleHome: Href;
	overlay?: ReactNode;
}

export function RoleProtectedLayout({
	requiredRole,
	otherRoleHome,
	overlay,
}: RoleProtectedLayoutProps) {
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const isLoading = useAuthStore((state) => state.isLoading);
	const userType = useAuthStore((state) => state.userType);

	if (!isLoading && !isAuthenticated) {
		return <Redirect href={ROUTES.auth.welcome} />;
	}

	if (!isLoading && isAuthenticated && userType !== requiredRole) {
		return <Redirect href={otherRoleHome} />;
	}

	return (
		<View style={{ flex: 1 }}>
			<Stack screenOptions={{ headerShown: false }} />
			{!isLoading && isAuthenticated && userType === requiredRole
				? overlay
				: null}
		</View>
	);
}
