import { Redirect, Stack } from "expo-router";
import { ROUTES } from "@/src/lib/routes";
import { useAuthStore } from "@/src/stores/auth-store";

export default function AuthLayout() {
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const isLoading = useAuthStore((state) => state.isLoading);
	const userType = useAuthStore((state) => state.userType);

	if (!isLoading && isAuthenticated) {
		if (userType === "technician") {
			return <Redirect href={ROUTES.technician.home} />;
		}
		return <Redirect href={ROUTES.user.home} />;
	}

	return (
		<Stack
			screenOptions={{
				headerShown: false,
			}}
		>
			<Stack.Screen name="welcome" />
			<Stack.Screen name="role-selection" />
			<Stack.Screen name="login" />
			<Stack.Screen name="signup" />
			<Stack.Screen name="tech-login" />
			<Stack.Screen name="tech-signup" />
			<Stack.Screen name="forgot-password" />
			<Stack.Screen name="reset-password" />
		</Stack>
	);
}
