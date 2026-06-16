import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { countMetric, METRICS } from "@/src/lib/metrics";
import { ROUTES } from "@/src/lib/navigation";
import { useAuthStore } from "@/src/stores/auth-store";
import { oauthComplete } from "../api/auth";
import { useUserSignupStore } from "../stores/user-signup-store";
import type { OAuthCompleteRequest } from "../types/auth";

/**
 * Completes a new OAuth user's profile (domain user row + address) and only THEN
 * persists the stashed Supabase session, which flips `isAuthenticated` and lets
 * the (auth) gate route to home.
 */
export function useOAuthCompleteMutation() {
	const setSession = useAuthStore((s) => s.setSession);
	const pendingSession = useUserSignupStore((s) => s.pendingSession);
	const reset = useUserSignupStore((s) => s.reset);

	return useMutation({
		mutationFn: (data: OAuthCompleteRequest) => oauthComplete(data),
		onSuccess: async () => {
			if (pendingSession) {
				await setSession(
					pendingSession.user,
					pendingSession.accessToken,
					pendingSession.refreshToken,
					"user",
				);
			}
			countMetric(METRICS.loginSuccess, 1, { attributes: { method: "google" } });
			reset();
			router.replace(ROUTES.user.home);
		},
	});
}
