import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { applyThemeToDocument, watchSystemColorScheme } from "@/lib/theme";
import { resolveThemeId } from "@/lib/theme/resolution";
import { useThemeStore } from "@/stores/theme-store";

interface RouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
	component: RootComponent,
});

function RootComponent() {
	const preference = useThemeStore((s) => s.preference);

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
