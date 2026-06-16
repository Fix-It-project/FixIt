import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { signIn } from "@/src/features/auth/api/auth";
import { toAppError } from "@/src/lib/errors";
import { countMetric, METRICS } from "@/src/lib/metrics";
import { ROUTES } from "@/src/lib/navigation";
import { useAuthStore } from "@/src/stores/auth-store";

export function useLoginMutation() {
	const { setSession } = useAuthStore();

	return useMutation({
		mutationKey: ["auth", "login"],
		mutationFn: (data: { email: string; password: string }) => signIn(data),
		onSuccess: async (response) => {
			await setSession(
				response.user,
				response.session.accessToken,
				response.session.refreshToken,
			);
			countMetric(METRICS.loginSuccess, 1, {
				attributes: { method: "password" },
			});
			router.replace(ROUTES.user.home);
		},
		onError: (error, variables) => {
			countMetric(METRICS.loginFailure, 1, {
				attributes: { method: "password" },
			});
			// A blocked homeowner is tagged with `accountStatus: "blocked"` (mirrors
			// the technician convention). Route them to the shared Blocked screen;
			// every other error falls through to the form banner.
			const app = toAppError(error);
			if (app.opts.fields?.accountStatus === "blocked") {
				router.replace(
					ROUTES.auth.blocked({
						role: "user",
						email: variables.email,
						message: app.userMessage,
						reason: app.opts.fields?.blockReason,
					}),
				);
			}
		},
	});
}
