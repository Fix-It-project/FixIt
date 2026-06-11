import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { technicianCancelApplication } from "@/src/features/auth/api/technician-auth";
import { logger } from "@/src/lib/logger";
import { ROUTES } from "@/src/lib/navigation";

export function useCancelApplicationMutation() {
	return useMutation({
		mutationFn: (data: { email: string; password: string }) =>
			technicianCancelApplication(data),
		onSuccess: () => {
			logger.info("auth.cancel", "technician_application_cancelled");
			Toast.show({
				type: "success",
				text1: "Application withdrawn",
				text2: "You can apply again whenever you're ready.",
				position: "top",
			});
			router.replace(ROUTES.auth.welcome);
		},
	});
}
