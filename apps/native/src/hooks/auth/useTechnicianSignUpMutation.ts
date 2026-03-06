import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { technicianSignUp } from "@/src/services/auth/api/technician-auth";
import { useTechnicianSignupStore } from "@/src/stores/technician-signup-store";
import { useLocationStore } from "@/src/stores/location-store";

import { buildFormData, type TechnicianSignUpInput } from "@/src/lib/helpers/signup-helpers";

export type { TechnicianSignUpInput };

export function useTechnicianSignUpMutation() {
	return useMutation({
		mutationFn: (data: TechnicianSignUpInput) => {
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
				router.push("/(auth)/Technician/login");
			}, 2000);
		},
		onSettled: () => {
			useTechnicianSignupStore.getState().reset();
		},
	});
}
