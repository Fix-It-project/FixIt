import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { technicianSignIn } from "@/src/features/auth/api/technician-auth";
import { toAppError } from "@/src/lib/errors";
import { ROUTES, type TechVerificationState } from "@/src/lib/navigation";
import { useAuthStore } from "@/src/stores/auth-store";

const VERIFICATION_STATES: readonly TechVerificationState[] = [
	"pending",
	"blocked",
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
			// The server blocks non-verified technicians and tags the 403 with a
			// machine-readable `accountStatus`. Route those to the verification
			// screen; let every other error fall through to the form's banner.
			const app = toAppError(error);
			const status = app.opts.fields?.accountStatus;
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
