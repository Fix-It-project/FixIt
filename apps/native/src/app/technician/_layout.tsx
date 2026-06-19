import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { RoleProtectedLayout } from "@/src/components/navigation/RoleProtectedLayout";
import { useActorOrdersRealtime } from "@/src/features/booking-orders/hooks/useActorOrdersRealtime";
import { technicianBookingsQueryOptions } from "@/src/features/booking-orders/hooks/useTechnicianBookingsQuery";
import { useTechTrackingController } from "@/src/features/booking-orders/hooks/useTechTrackingController";
import { RouteErrorBoundary } from "@/src/lib/errors/error-boundary";
import { ROUTES } from "@/src/lib/navigation";
import { useAuthStore } from "@/src/stores/auth-store";

export default function TechnicianLayout() {
	const userId = useAuthStore((s) => s.user?.id);
	const queryClient = useQueryClient();
	useActorOrdersRealtime("technician", userId);
	useTechTrackingController();

	// Warm the technician-bookings cache once authenticated so the first Jobs /
	// history / booking view renders against cache instead of a cold fetch.
	useEffect(() => {
		if (!userId) return;
		void queryClient.prefetchQuery(technicianBookingsQueryOptions(userId));
	}, [userId, queryClient]);

	return (
		<RouteErrorBoundary>
			<RoleProtectedLayout
				requiredRole="technician"
				otherRoleHome={ROUTES.user.home}
			/>
		</RouteErrorBoundary>
	);
}
