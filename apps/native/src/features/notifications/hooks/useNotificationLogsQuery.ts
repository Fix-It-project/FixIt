import { useInfiniteQuery } from "@tanstack/react-query";
import { getNotificationLogs } from "@/src/features/notifications/api/notifications";
import type { NotificationPreferencesRole } from "@/src/features/notifications/types";

export const NOTIFICATION_LOG_PAGE_SIZE = 20;

export function useNotificationLogsQuery(
	role: NotificationPreferencesRole | null,
) {
	return useInfiniteQuery({
		queryKey: ["notification-logs", role],
		queryFn: ({ pageParam }) =>
			getNotificationLogs(role as NotificationPreferencesRole, {
				limit: NOTIFICATION_LOG_PAGE_SIZE,
				offset: pageParam,
			}),
		initialPageParam: 0,
		getNextPageParam: (lastPage, allPages) =>
			lastPage.length < NOTIFICATION_LOG_PAGE_SIZE
				? undefined
				: allPages.length * NOTIFICATION_LOG_PAGE_SIZE,
		enabled: role !== null,
	});
}
