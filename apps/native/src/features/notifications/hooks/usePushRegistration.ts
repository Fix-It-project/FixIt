import { useEffect, useRef } from "react";
import {
  getNotificationPreferences,
  registerTechnicianPushDevice,
  registerUserPushDevice,
} from "@/src/features/notifications/api/notifications";
import { getExpoPushToken } from "@/src/features/notifications/utils/getExpoPushToken";
import { configureAndroidNotificationChannel } from "@/src/features/notifications/utils/configureAndroidNotificationChannel";
import { logger } from "@/src/lib/logger";
import { useAuthStore } from "@/src/stores/auth-store";

export function usePushRegistration(enabled: boolean): void {
  const user = useAuthStore((state) => state.user);
  const userType = useAuthStore((state) => state.userType);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const lastRegisteredKeyRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    void configureAndroidNotificationChannel();
  }, []);

  useEffect(() => {
    if (!enabled || isLoading || !isAuthenticated || !user?.id || !userType) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const preferences = await getNotificationPreferences(userType);
        if (!cancelled) {
          await configureAndroidNotificationChannel(preferences);
        }
      } catch (error) {
        logger.warn("PushNotifications", "Failed to load notification preferences", {
          role: userType,
          error: error instanceof Error ? error.message : String(error),
        });
      }

      const expoPushToken = await getExpoPushToken();
      if (!expoPushToken || cancelled) return;

      const registrationKey = `${userType}:${user.id}:${expoPushToken}`;
      if (lastRegisteredKeyRef.current === registrationKey) {
        return;
      }

      try {
        if (userType === "technician") {
          await registerTechnicianPushDevice(expoPushToken);
        } else {
          await registerUserPushDevice(expoPushToken);
        }
        lastRegisteredKeyRef.current = registrationKey;
        logger.info("PushNotifications", "Expo push device registered", {
          role: userType,
          userId: user.id,
        });
      } catch (error) {
        logger.error("PushNotifications", "Failed to register Expo push device", error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, isAuthenticated, isLoading, user?.id, userType]);
}
