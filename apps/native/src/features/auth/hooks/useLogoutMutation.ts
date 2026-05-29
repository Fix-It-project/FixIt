import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { signOut } from "@/src/features/auth/api/auth";
import { technicianSignOut } from "@/src/features/auth/api/technician-auth";
import {
	unregisterTechnicianPushDevice,
	unregisterUserPushDevice,
} from "@/src/features/notifications/api/notifications";
import { getExpoPushToken } from "@/src/features/notifications/utils/getExpoPushToken";
import queryClient from "@/src/config/query-client";
import { logger } from "@/src/lib/logger";
import { ROUTES } from "@/src/lib/navigation";
import { useAuthStore } from "@/src/stores/auth-store";

export function useLogoutMutation() {
	const { clearSession, userType } = useAuthStore();

	return useMutation({
		mutationFn: async () => {
			const expoPushToken = await getExpoPushToken({ requestPermission: false });
			if (expoPushToken) {
				try {
					if (userType === "technician") {
						await unregisterTechnicianPushDevice(expoPushToken);
					} else {
						await unregisterUserPushDevice(expoPushToken);
					}
				} catch (error) {
					logger.warn("PushNotifications", "Failed to unregister device on logout", {
						error: error instanceof Error ? error.message : String(error),
					});
				}
			}
			return userType === "technician" ? technicianSignOut() : signOut();
		},
		onSuccess: async () => {
			await clearSession();
			queryClient.clear();
			router.replace(ROUTES.auth.welcome);
		},
	});
}
