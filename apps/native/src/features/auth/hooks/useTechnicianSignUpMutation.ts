import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { technicianSignUp } from "@/src/features/auth/api/technician-auth";
import { useTechnicianSignupStore } from "@/src/features/auth/stores/technician-signup-store";
import { buildFormData } from "@/src/features/auth/utils/signup-helpers";
import { ROUTES } from "@/src/lib/routes";
import { useLocationStore } from "@/src/stores/location-store";

export type { TechnicianSignUpInput } from "@/src/features/auth/utils/signup-helpers";

export function useTechnicianSignUpMutation() {
	return useMutation({
		mutationFn: (
			data: import("@/src/features/auth/utils/signup-helpers").TechnicianSignUpInput,
		) => {
			const location = useLocationStore.getState().location;
			const formData = buildFormData(data, location);
			return technicianSignUp(formData);
		},
		onSuccess: (response) => {
			Toast.show({
				type: "success",
				text1: "Application Submitted!",
				text2:
					response.message ||
					"Your technician account has been created. Redirecting to sign in...",
				position: "top",
				visibilityTime: 2000,
			});
			setTimeout(() => {
				router.dismissAll();
				router.push(ROUTES.auth.techLogin);
			}, 2000);
		},
		onSettled: () => {
			useTechnicianSignupStore.getState().reset();
		},
	});
}
