import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { logger } from "@/src/lib/logger";

interface GetExpoPushTokenOptions {
  readonly requestPermission?: boolean;
}

function getProjectId(): string | undefined {
  const fromExpoConfig = Constants?.expoConfig?.extra?.eas?.projectId;
  if (typeof fromExpoConfig === "string" && fromExpoConfig.length > 0) {
    return fromExpoConfig;
  }
  const fromEasConfig = Constants?.easConfig?.projectId;
  return typeof fromEasConfig === "string" && fromEasConfig.length > 0
    ? fromEasConfig
    : undefined;
}

export async function getExpoPushToken(
  options: GetExpoPushTokenOptions = {},
): Promise<string | undefined> {
  if (Platform.OS !== "android") return undefined;

  const { requestPermission = true } = options;

  try {
    let permissions = await Notifications.getPermissionsAsync();
    if (!permissions.granted && requestPermission) {
      permissions = await Notifications.requestPermissionsAsync();
    }
    if (!permissions.granted) {
      return undefined;
    }

    const projectId = getProjectId();
    if (!projectId) {
      logger.warn("PushNotifications", "Missing EAS projectId for Expo push token");
      return undefined;
    }

    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    return typeof token.data === "string" ? token.data : undefined;
  } catch (error) {
    logger.warn("PushNotifications", "Unable to fetch Expo push token", {
      error: error instanceof Error ? error.message : String(error),
    });
    return undefined;
  }
}
