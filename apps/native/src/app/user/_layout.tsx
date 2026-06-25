import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { RoleProtectedLayout } from "@/src/components/navigation/RoleProtectedLayout";
import { useActorOrdersRealtime } from "@/src/features/booking-orders/hooks/useActorOrdersRealtime";
import { userOrdersQueryOptions } from "@/src/features/booking-orders/hooks/useUserOrders";
import { RouteErrorBoundary } from "@/src/lib/errors/error-boundary";
import { ROUTES } from "@/src/lib/navigation";
import { useAuthStore } from "@/src/stores/auth-store";

export default function UserLayout() {
	const userId = useAuthStore((s) => s.user?.id);
	const queryClient = useQueryClient();
	useActorOrdersRealtime("user", userId);

	// Warm the user-orders cache once authenticated so the first Home / Activity /
	// history view renders against cache instead of a cold network round-trip.
	useEffect(() => {
		if (!userId) return;
		queryClient.prefetchQuery(userOrdersQueryOptions());
	}, [userId, queryClient]);

	return (
		<RouteErrorBoundary>
			<RoleProtectedLayout
				requiredRole="user"
				otherRoleHome={ROUTES.technician.home}
			/>
		</RouteErrorBoundary>
	);
}
