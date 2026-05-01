import { type Href, Redirect, Stack } from "expo-router";
import { ROUTES } from "@/src/lib/routes";
import { useAuthStore, type UserType } from "@/src/stores/auth-store";

interface RoleProtectedLayoutProps {
	requiredRole: UserType;
	otherRoleHome: Href;
}

export function RoleProtectedLayout({
	requiredRole,
	otherRoleHome,
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

	return <Stack screenOptions={{ headerShown: false }} />;
}
