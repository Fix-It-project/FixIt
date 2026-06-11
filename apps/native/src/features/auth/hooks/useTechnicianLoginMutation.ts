import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { technicianSignIn } from "@/src/features/auth/api/technician-auth";
import { toAppError } from "@/src/lib/errors";
import { ROUTES, type TechVerificationState } from "@/src/lib/navigation";
import { useAuthStore } from "@/src/stores/auth-store";

const VERIFICATION_STATES: readonly TechVerificationState[] = [
	"pending",
	"rejected",
];

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
			router.replace(ROUTES.technician.home);
		},
		onError: (error, variables) => {
			// The server tags non-verified technicians with a machine-readable
			// `accountStatus`. Blocked → shared Blocked screen; pending/rejected →
			// verification screen; everything else falls through to the form banner.
			const app = toAppError(error);
			const status = app.opts.fields?.accountStatus;
			if (status === "blocked") {
				router.replace(
					ROUTES.auth.blocked({
						role: "technician",
						email: variables.email,
						message: app.userMessage,
						reason: app.opts.fields?.blockReason,
					}),
				);
				return;
			}
			if (
				status &&
				VERIFICATION_STATES.includes(status as TechVerificationState)
			) {
				router.replace(
					ROUTES.auth.techVerification({
						state: status as TechVerificationState,
						email: variables.email,
						message: app.userMessage,
					}),
				);
			}
		},
	});
}
