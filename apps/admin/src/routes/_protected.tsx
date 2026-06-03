import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { meQuery } from "@/lib/auth-query";
import { useAuthStore } from "@/stores/auth-store";

export const Route = createFileRoute("/_protected")({
	beforeLoad: async ({ context, location }) => {
		// Gate on a verified session (http-only cookie), not the optimistic flag.
		// ensureQueryData caches, so navigations between protected routes reuse it.
		const user = await context.queryClient.ensureQueryData(meQuery).catch(() => null);
		if (!user) {
			useAuthStore.getState().clearSession();
			throw redirect({ to: "/login", search: { redirect: location.href } });
		}
		useAuthStore.getState().setSession(user);
	},
	component: ProtectedLayout,
});

function ProtectedLayout() {
	return (
		<AppShell>
			<Outlet />
		</AppShell>
	);
}
