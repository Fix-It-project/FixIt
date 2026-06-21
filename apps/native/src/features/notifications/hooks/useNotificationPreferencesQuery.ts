import { useQuery } from "@tanstack/react-query";
import { getNotificationPreferences } from "@/src/features/notifications/api/notifications";
import type { NotificationViewerRole } from "@/src/features/notifications/types";

export function useNotificationPreferencesQuery(
  role: NotificationViewerRole | null,
) {
  return useQuery({
    queryKey: ["notification-preferences", role],
    queryFn: () => getNotificationPreferences(role as NotificationViewerRole),
    enabled: role !== null,
  });
}
