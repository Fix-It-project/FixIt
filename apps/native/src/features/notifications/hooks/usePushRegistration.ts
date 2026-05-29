import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import {
  registerTechnicianPushDevice,
  registerUserPushDevice,
} from "@/src/features/notifications/api/notifications";
import { getExpoPushToken } from "@/src/features/notifications/utils/getExpoPushToken";
import { logger } from "@/src/lib/logger";
import { useAuthStore } from "@/src/stores/auth-store";

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync("default", {
    name: "Default",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#1565D8",
  });
}

export function usePushRegistration(enabled: boolean): void {
  const user = useAuthStore((state) => state.user);
  const userType = useAuthStore((state) => state.userType);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const lastRegisteredKeyRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    void ensureAndroidChannel();
  }, []);

  useEffect(() => {
    if (!enabled || isLoading || !isAuthenticated || !user?.id || !userType) {
      return;
    }

    let cancelled = false;

    void (async () => {
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
