import { RoleProtectedLayout } from "@/src/components/navigation/RoleProtectedLayout";
import { useActorOrdersRealtime } from "@/src/features/booking-orders/hooks/useActorOrdersRealtime";
import { RouteErrorBoundary } from "@/src/lib/errors/error-boundary";
import { ROUTES } from "@/src/lib/navigation";
import { useAuthStore } from "@/src/stores/auth-store";

export default function TechnicianLayout() {
	const userId = useAuthStore((s) => s.user?.id);
	useActorOrdersRealtime("technician", userId);

	return (
		<RouteErrorBoundary>
			<RoleProtectedLayout
				requiredRole="technician"
				otherRoleHome={ROUTES.user.home}
			/>
		</RouteErrorBoundary>
	);
}
