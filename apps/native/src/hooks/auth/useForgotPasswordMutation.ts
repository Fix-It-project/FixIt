import { useMutation } from "@tanstack/react-query";
import { forgotPassword } from "@/src/features/auth/api/auth";

export function useForgotPasswordMutation() {
	return useMutation({
		mutationFn: (data: { email: string }) => forgotPassword(data),
	});
}
