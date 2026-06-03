import { queryOptions } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { AdminUser } from "@/stores/auth-store";

/**
 * Verified session check. Used in route `beforeLoad` to gate protected routes on
 * the http-only session cookie (the real source of truth) rather than the
 * optimistic persisted flag. Cached so navigations don't refetch on every hop;
 * `retry: false` makes a 401 fail fast into the redirect.
 */
export const meQuery = queryOptions({
	queryKey: ["auth", "me"],
	queryFn: async (): Promise<AdminUser> => {
		const { data } = await apiClient.get<{ user: AdminUser }>("/api/admin/auth/me");
		return data.user;
	},
	retry: false,
	staleTime: 5 * 60 * 1000,
});
