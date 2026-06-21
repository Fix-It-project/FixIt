import {
	type InfiniteData,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { markAllNotificationLogsRead } from "@/src/features/notifications/api/notifications";
import type {
	NotificationLogItem,
	NotificationViewerRole,
} from "@/src/features/notifications/types";

function markItemRead(
	item: NotificationLogItem,
	readAt: string,
): NotificationLogItem {
	return { ...item, isRead: true, readAt: item.readAt ?? readAt };
}

function markPageRead(
	page: NotificationLogItem[],
	readAt: string,
): NotificationLogItem[] {
	return page.map((item) => markItemRead(item, readAt));
}

export function useMarkAllNotificationsReadMutation(
	role: NotificationViewerRole,
) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => markAllNotificationLogsRead(role),
		onSuccess: () => {
			queryClient.setQueryData(["notification-unread-count", role], 0);
			queryClient.setQueryData<
				InfiniteData<NotificationLogItem[], number> | undefined
			>(["notification-logs", role], (current) => {
				if (!current) return current;
				const readAt = new Date().toISOString();
				return {
					...current,
					pages: current.pages.map((page) => markPageRead(page, readAt)),
				};
			});
			queryClient.invalidateQueries({
				queryKey: ["notification-unread-count", role],
			});
		},
	});
}
