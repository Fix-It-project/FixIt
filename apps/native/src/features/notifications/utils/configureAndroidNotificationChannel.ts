import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import type { NotificationPreferences } from "@/src/features/notifications/types";

export const FIXIT_ALERTS_CHANNEL_ID = "fixit-alerts-v2";

const DEFAULT_PREFERENCES: NotificationPreferences = {
  notificationsEnabled: true,
  soundEnabled: true,
  vibrationEnabled: true,
};

export async function configureAndroidNotificationChannel(
  preferences: NotificationPreferences = DEFAULT_PREFERENCES,
): Promise<void> {
  if (Platform.OS !== "android") return;

  const channel: Notifications.NotificationChannelInput = {
    name: "FixIt Alerts",
    importance: Notifications.AndroidImportance.MAX,
    enableVibrate: preferences.vibrationEnabled,
    vibrationPattern: preferences.vibrationEnabled ? [0, 250, 250, 250] : [0],
    lightColor: "#1565D8",
  };

  if (!preferences.soundEnabled) {
    channel.sound = null;
  }

  await Notifications.setNotificationChannelAsync(FIXIT_ALERTS_CHANNEL_ID, channel);
}
