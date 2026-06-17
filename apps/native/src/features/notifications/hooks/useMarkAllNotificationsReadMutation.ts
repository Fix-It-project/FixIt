import {
	type InfiniteData,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
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
			queryClient.setQueryData<
				InfiniteData<NotificationLogItem[], number> | undefined
			>(["notification-logs", role], (current) => {
				const readAt = new Date().toISOString();

				return current
					? {
							...current,
							pages: current.pages.map((page) =>
								page.map((item) => ({
									...item,
									isRead: true,
									readAt: item.readAt ?? readAt,
								})),
							),
						}
					: current;
			});
			void queryClient.invalidateQueries({
				queryKey: ["notification-unread-count", role],
			});
		},
	});
}
