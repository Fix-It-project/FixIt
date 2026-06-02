import { useQuery } from "@tanstack/react-query";
import { getNotificationPreferences } from "@/src/features/notifications/api/notifications";
import type { NotificationPreferencesRole } from "@/src/features/notifications/types";

export function useNotificationPreferencesQuery(
  role: NotificationPreferencesRole | null,
) {
  return useQuery({
    queryKey: ["notification-preferences", role],
    queryFn: () => getNotificationPreferences(role as NotificationPreferencesRole),
    enabled: role !== null,
  });
}
