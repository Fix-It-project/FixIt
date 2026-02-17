import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { resetPassword } from "@/src/services/auth/api/auth";

export function useResetPasswordMutation(userType: string) {
	return useMutation({
		mutationFn: (data: { accessToken: string; refreshToken: string; newPassword: string }) =>
			resetPassword(data),
		onSuccess: () => {
			// Redirect to the correct login page based on user type
			if (userType === "technician") {
				router.replace("/(auth)/Technician/login");
			} else {
				router.replace("/(auth)/User/login");
			}
		},
	});
}
