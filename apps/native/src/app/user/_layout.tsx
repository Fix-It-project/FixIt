import { Redirect, Stack } from "expo-router";
import { ROUTES } from "@/src/lib/routes";
import { useAuthStore } from "@/src/stores/auth-store";

export default function UserLayout() {
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const isLoading = useAuthStore((state) => state.isLoading);
	const userType = useAuthStore((state) => state.userType);

	if (!isLoading && !isAuthenticated) {
		return <Redirect href={ROUTES.auth.welcome} />;
	}

	if (!isLoading && isAuthenticated && userType !== "user") {
		return <Redirect href={ROUTES.technician.home} />;
	}

	return <Stack screenOptions={{ headerShown: false }} />;
}
