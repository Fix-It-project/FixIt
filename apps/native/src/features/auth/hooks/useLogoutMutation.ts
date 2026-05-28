import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { signOut } from "@/src/features/auth/api/auth";
import { technicianSignOut } from "@/src/features/auth/api/technician-auth";
import queryClient from "@/src/config/query-client";
import { ROUTES } from "@/src/lib/navigation";
import { useAuthStore } from "@/src/stores/auth-store";

export function useLogoutMutation() {
	const { clearSession, userType } = useAuthStore();

	return useMutation({
		mutationFn: () =>
			userType === "technician" ? technicianSignOut() : signOut(),
		onSuccess: async () => {
			await clearSession();
			queryClient.clear();
			router.replace(ROUTES.auth.welcome);
		},
	});
}
