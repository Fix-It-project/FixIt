import { useQuery } from "@tanstack/react-query";
import { getNotificationUnreadCount } from "@/src/features/notifications/api/notifications";
import type { NotificationViewerRole } from "@/src/features/notifications/types";

export function useNotificationUnreadCountQuery(
  role: NotificationViewerRole | null,
) {
  return useQuery({
    queryKey: ["notification-unread-count", role],
    queryFn: () => getNotificationUnreadCount(role as NotificationViewerRole),
    enabled: role !== null,
    refetchInterval: 30_000,
  });
}
