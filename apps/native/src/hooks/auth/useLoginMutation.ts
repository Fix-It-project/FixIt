import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { signIn } from "@/src/features/auth/api/auth";
import { APP_ROOT_ROUTE } from "@/src/lib/navigation-routes";
import { useAuthStore } from "@/src/stores/auth-store";

export function useLoginMutation() {
	const { setSession } = useAuthStore();

	return useMutation({
		mutationFn: (data: { email: string; password: string }) => signIn(data),
		onSuccess: async (response) => {
			await setSession(
				response.user,
				response.session.accessToken,
				response.session.refreshToken,
			);
			router.replace(APP_ROOT_ROUTE);
		},
	});
}
