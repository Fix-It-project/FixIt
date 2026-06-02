import { useQuery } from "@tanstack/react-query";
import { getNotificationLogs } from "@/src/features/notifications/api/notifications";
import type { NotificationPreferencesRole } from "@/src/features/notifications/types";

export function useNotificationLogsQuery(role: NotificationPreferencesRole | null) {
  return useQuery({
    queryKey: ["notification-logs", role],
    queryFn: () => getNotificationLogs(role as NotificationPreferencesRole),
    enabled: role !== null,
  });
}
