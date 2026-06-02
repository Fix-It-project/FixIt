import { useQuery } from "@tanstack/react-query";
import { getNotificationUnreadCount } from "@/src/features/notifications/api/notifications";
import type { NotificationPreferencesRole } from "@/src/features/notifications/types";

export function useNotificationUnreadCountQuery(
  role: NotificationPreferencesRole | null,
) {
  return useQuery({
    queryKey: ["notification-unread-count", role],
    queryFn: () => getNotificationUnreadCount(role as NotificationPreferencesRole),
    enabled: role !== null,
    refetchInterval: 30_000,
  });
}
