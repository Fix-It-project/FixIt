import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { Alert } from "react-native";
import { signUp } from "@/src/services/auth/api/auth";

export function useSignUpMutation() {
	return useMutation({
		mutationFn: (data: {
			email: string;
			password: string;
			fullName: string;
			phone: string;
		}) => signUp(data),
		onSuccess: (response) => {
			Alert.alert(
				"Account Created!",
				response.message ||
					"Your account has been created successfully. Please sign in.",
				[{ text: "Sign In", onPress: () => router.replace("/(auth)/User/login") }],
			);
		},
	});
}
