import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { signUp } from "@/src/services/auth/api/auth";
import type { SignUpRequest } from "@/src/services/auth/types/auth";

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
				visibilityTime: 3000,
			});
			setTimeout(() => {
				router.replace("/(auth)/User/login");
			}, 3000);
		},
	});
}
