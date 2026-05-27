import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useAuthStore } from "@/stores/auth-store";

export const Route = createFileRoute("/_protected")({
	beforeLoad: ({ location }) => {
		const { isAuthenticated } = useAuthStore.getState();
		if (!isAuthenticated) {
			throw redirect({
				to: "/login",
				search: { redirect: location.href },
			});
		}
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
