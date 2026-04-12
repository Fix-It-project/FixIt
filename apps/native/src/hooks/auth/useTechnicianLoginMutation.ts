import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { technicianSignIn } from "@/src/features/auth/api/technician-auth";
import { useAuthStore } from "@/src/stores/auth-store";

export function useTechnicianLoginMutation() {
	const { setSession } = useAuthStore();

	return useMutation({
		mutationFn: (data: { email: string; password: string }) =>
			technicianSignIn(data),
		onSuccess: async (response) => {
			await setSession(
				response.technician,
				response.session.accessToken,
				response.session.refreshToken,
				"technician",
			);
			router.replace("/(tech-app)");
		},
	});
}
