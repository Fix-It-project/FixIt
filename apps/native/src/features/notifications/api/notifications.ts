import apiClient from "@/src/config/api-client";
import type {
  NotificationLogItem,
  NotificationPreferences,
  NotificationPreferencesRole,
} from "@/src/features/notifications/types";

interface NotificationPreferencesApiResponse {
  data: {
    notifications_enabled: boolean;
    sound_enabled: boolean;
    vibration_enabled: boolean;
  };
}

interface NotificationLogApiRecord {
  id: string;
  type: string;
  title: string;
  body: string;
  sender_name: string | null;
  sender_image_url: string | null;
  order_id: string | null;
  viewer_role: NotificationPreferencesRole | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

interface NotificationLogsApiResponse {
  data: NotificationLogApiRecord[];
}

interface NotificationUnreadCountApiResponse {
  data: {
    unread_count: number;
  };
}

function toPreferences(
  response: NotificationPreferencesApiResponse,
): NotificationPreferences {
  return {
    notificationsEnabled: response.data.notifications_enabled,
    soundEnabled: response.data.sound_enabled,
    vibrationEnabled: response.data.vibration_enabled,
  };
}

function preferencesPath(role: NotificationPreferencesRole): string {
  return role === "technician"
    ? "/api/notifications/technician/preferences"
    : "/api/notifications/user/preferences";
}

function logsPath(role: NotificationPreferencesRole): string {
  return role === "technician"
    ? "/api/notifications/technician/logs"
    : "/api/notifications/user/logs";
}

function unreadCountPath(role: NotificationPreferencesRole): string {
  return role === "technician"
    ? "/api/notifications/technician/logs/unread-count"
    : "/api/notifications/user/logs/unread-count";
}

function markReadAllPath(role: NotificationPreferencesRole): string {
  return role === "technician"
    ? "/api/notifications/technician/logs/mark-read-all"
    : "/api/notifications/user/logs/mark-read-all";
}

function toLogItem(record: NotificationLogApiRecord): NotificationLogItem {
  return {
    id: record.id,
    type: record.type,
    title: record.title,
    body: record.body,
    senderName: record.sender_name ?? undefined,
    senderImageUrl: record.sender_image_url ?? undefined,
    orderId: record.order_id ?? undefined,
    viewerRole: record.viewer_role ?? undefined,
    isRead: record.is_read,
    readAt: record.read_at ?? undefined,
    createdAt: record.created_at,
  };
}

export async function registerUserPushDevice(expoPushToken: string): Promise<void> {
  await apiClient.post("/api/notifications/user/devices/register", {
    expo_push_token: expoPushToken,
  });
}

export async function unregisterUserPushDevice(expoPushToken: string): Promise<void> {
  await apiClient.post("/api/notifications/user/devices/unregister", {
    expo_push_token: expoPushToken,
  });
}

export async function registerTechnicianPushDevice(
  expoPushToken: string,
): Promise<void> {
  await apiClient.post("/api/notifications/technician/devices/register", {
    expo_push_token: expoPushToken,
  });
}

export async function unregisterTechnicianPushDevice(
  expoPushToken: string,
): Promise<void> {
  await apiClient.post("/api/notifications/technician/devices/unregister", {
    expo_push_token: expoPushToken,
  });
}

export async function getNotificationPreferences(
  role: NotificationPreferencesRole,
): Promise<NotificationPreferences> {
  const response = await apiClient.get<NotificationPreferencesApiResponse>(
    preferencesPath(role),
  );
  return toPreferences(response.data);
}

export async function updateNotificationPreferences(
  role: NotificationPreferencesRole,
  preferences: NotificationPreferences,
): Promise<NotificationPreferences> {
  const response = await apiClient.patch<NotificationPreferencesApiResponse>(
    preferencesPath(role),
    {
      notifications_enabled: preferences.notificationsEnabled,
      sound_enabled: preferences.soundEnabled,
      vibration_enabled: preferences.vibrationEnabled,
    },
  );
  return toPreferences(response.data);
}

export async function getNotificationLogs(
  role: NotificationPreferencesRole,
  options: { limit?: number; offset?: number } = {},
): Promise<NotificationLogItem[]> {
  const response = await apiClient.get<NotificationLogsApiResponse>(logsPath(role), {
    params: {
      limit: options.limit ?? 20,
      offset: options.offset ?? 0,
    },
  });
  return response.data.data.map(toLogItem);
}

export async function getNotificationUnreadCount(
  role: NotificationPreferencesRole,
): Promise<number> {
  const response = await apiClient.get<NotificationUnreadCountApiResponse>(
    unreadCountPath(role),
  );
  return response.data.data.unread_count;
}

export async function markAllNotificationLogsRead(
  role: NotificationPreferencesRole,
): Promise<void> {
  await apiClient.post(markReadAllPath(role));
}
