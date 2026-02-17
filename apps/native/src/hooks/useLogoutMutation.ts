import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { signOut } from "@/src/services/auth/api/auth";
import { useAuthStore } from "@/src/stores/auth-store";
import queryClient from "@/src/lib/query-client";

export function useLogoutMutation() {
	const { clearSession } = useAuthStore();

	return useMutation({
		mutationFn: () => signOut(),
		onSuccess: async () => {
			await clearSession();
			queryClient.clear();
			router.replace("/(auth)/get-started");
		},
	});
}
