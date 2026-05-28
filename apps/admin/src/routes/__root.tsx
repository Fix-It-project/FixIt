import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { applyThemeToDocument, watchSystemColorScheme } from "@/lib/theme";
import { resolveThemeId } from "@/lib/theme/resolution";
import { type AdminUser, useAuthStore } from "@/stores/auth-store";
import { useThemeStore } from "@/stores/theme-store";

interface RouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
	component: RootComponent,
});

function RootComponent() {
	const preference = useThemeStore((s) => s.preference);

	// Reconcile the optimistic auth flag against the http-only session cookie on
	// load: a stale flag (cookie expired) gets cleared, a valid one refreshes the
	// cached admin. A 401 here is handled by the api-client interceptor.
	useEffect(() => {
		if (!useAuthStore.getState().isAuthenticated) return;
		apiClient
			.get<{ user: AdminUser }>("/api/admin/auth/me")
			.then(({ data }) => useAuthStore.getState().setSession(data.user))
			.catch(() => undefined);
	}, []);

	useEffect(() => {
		const apply = () => {
			const system = window.matchMedia("(prefers-color-scheme: dark)").matches
				? "dark"
				: "light";
			applyThemeToDocument(resolveThemeId(preference, system));
		};
		apply();
		if (preference === "system") {
			return watchSystemColorScheme(apply);
		}
		return undefined;
	}, [preference]);

	return <Outlet />;
}
