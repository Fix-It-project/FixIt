import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { supabase } from "@/src/lib/supabase";

export function useResetPasswordMutation(userType: string) {
	return useMutation({
		mutationFn: async (data: { accessToken: string; refreshToken: string; newPassword: string }) => {
			const { error: sessionError } = await supabase.auth.setSession({
				access_token: data.accessToken,
				refresh_token: data.refreshToken,
			});
			if (sessionError) throw sessionError;

			const { error: updateError } = await supabase.auth.updateUser({
				password: data.newPassword,
			});
			if (updateError) throw updateError;
			await supabase.auth.signOut();
		},
		onSuccess: () => {
			Toast.show({
				type: "success",
				text1: "Password Reset!",
				text2: "Your password has been updated. Please log in.",
				position: "top",
				visibilityTime: 3000,
			});
			if (userType === "technician") {
				router.replace("/(auth)/Technician/login");
			} else {
				router.replace("/(auth)/User/login");
			}
		},
	});
}
