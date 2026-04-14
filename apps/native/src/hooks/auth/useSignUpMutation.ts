import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { signUp } from "@/src/features/auth/api/auth";
import type { SignUpRequest } from "@/src/features/auth/types/auth";
import { ROUTES } from "@/src/lib/routes";

export function useSignUpMutation() {
	return useMutation({
		mutationFn: (data: SignUpRequest) => signUp(data),
		onSuccess: (response) => {
			Toast.show({
				type: "success",
				text1: "Account Created!",
				text2:
					response.message ||
					"Your account has been created successfully. Redirecting to sign in...",
				position: "top",
				visibilityTime: 2000,
			});
			setTimeout(() => {
				router.dismissAll();
				router.push(ROUTES.auth.login);
			}, 2000);
		},
	});
}
