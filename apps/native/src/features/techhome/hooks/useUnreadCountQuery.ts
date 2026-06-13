import { useQuery } from "@tanstack/react-query";
import { getUnreadNotificationCount } from "../api/tech-home";
import { techHomeKeys } from "../schemas/query-keys";

/** Shares the notifications feature's cache key so the badge stays in sync. */
export function useUnreadCountQuery() {
	return useQuery({
		queryKey: techHomeKeys.unreadCount,
		queryFn: getUnreadNotificationCount,
	});
}
