import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { technicianSignUp } from "@/src/features/auth/api/technician-auth";
import { useTechnicianSignupStore } from "@/src/features/auth/stores/technician-signup-store";
import { buildFormData } from "@/src/features/auth/utils/signup-helpers";
import { getExpoPushToken } from "@/src/features/notifications/utils/getExpoPushToken";
import { logger } from "@/src/lib/logger";
import { ROUTES } from "@/src/lib/navigation";
import { useLocationStore } from "@/src/stores/location-store";

export type { TechnicianSignUpInput } from "@/src/features/auth/utils/signup-helpers";

export function useTechnicianSignUpMutation() {
	return useMutation({
		mutationFn: async (
			data: import("@/src/features/auth/utils/signup-helpers").TechnicianSignUpInput,
		) => {
			const location = useLocationStore.getState().location;
			// Capture the push token now (the only pre-verification moment we have
			// this device + identity) so we can notify them once an admin approves.
			// Android-only / requires permission; undefined otherwise.
			const expoPushToken = await getExpoPushToken({ requestPermission: true });
			logger.info("auth.signup", "technician_signup_submitting", {
				hasLocation: !!location,
				hasPushToken: !!expoPushToken,
			});
			const formData = buildFormData(data, location, expoPushToken);
			return technicianSignUp(formData);
		},
		onSuccess: (response, variables) => {
			logger.info("auth.signup", "technician_signup_succeeded", {
				technicianId: response.technician.id,
			});
			// Application submitted → land on the verification screen. They're
			// pending by definition and can't sign in until an admin approves.
			router.dismissAll();
			router.replace(
				ROUTES.auth.techVerification({
					state: "pending",
					email: variables.email,
				}),
			);
		},
		onSettled: () => {
			useTechnicianSignupStore.getState().reset();
		},
	});
}
