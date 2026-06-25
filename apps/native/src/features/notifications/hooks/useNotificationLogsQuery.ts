import { useInfiniteQuery } from "@tanstack/react-query";
import { getNotificationLogs } from "@/src/features/notifications/api/notifications";
import type { NotificationViewerRole } from "@/src/features/notifications/types";

export const NOTIFICATION_LOG_PAGE_SIZE = 20;

export function useNotificationLogsQuery(
	role: NotificationViewerRole | null,
) {
	return useInfiniteQuery({
		queryKey: ["notification-logs", role],
		queryFn: ({ pageParam }) =>
			getNotificationLogs(role as NotificationViewerRole, {
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
