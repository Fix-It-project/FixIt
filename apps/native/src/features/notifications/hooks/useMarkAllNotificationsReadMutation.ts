import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markAllNotificationLogsRead } from "@/src/features/notifications/api/notifications";
import type {
  NotificationLogItem,
  NotificationPreferencesRole,
} from "@/src/features/notifications/types";

export function useMarkAllNotificationsReadMutation(
  role: NotificationPreferencesRole,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markAllNotificationLogsRead(role),
    onSuccess: () => {
      queryClient.setQueryData(["notification-unread-count", role], 0);
      queryClient.setQueryData<NotificationLogItem[] | undefined>(
        ["notification-logs", role],
        (current) =>
          current?.map((item) => ({
            ...item,
            isRead: true,
            readAt: item.readAt ?? new Date().toISOString(),
          })),
      );
      void queryClient.invalidateQueries({ queryKey: ["notification-unread-count", role] });
    },
  });
}
