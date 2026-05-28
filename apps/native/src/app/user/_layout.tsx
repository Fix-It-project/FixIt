import { RoleProtectedLayout } from "@/src/components/navigation/RoleProtectedLayout";
import { useActorOrdersRealtime } from "@/src/features/booking-orders/hooks/useActorOrdersRealtime";
import ReviewPromptHost from "@/src/features/reviews/components/user/ReviewPromptHost";
import { RouteErrorBoundary } from "@/src/lib/errors/error-boundary";
import { ROUTES } from "@/src/lib/navigation";
import { useAuthStore } from "@/src/stores/auth-store";

export default function UserLayout() {
	const userId = useAuthStore((s) => s.user?.id);
	useActorOrdersRealtime("user", userId);

	return (
		<RouteErrorBoundary>
			<RoleProtectedLayout
				requiredRole="user"
				otherRoleHome={ROUTES.technician.home}
				overlay={<ReviewPromptHost />}
			/>
		</RouteErrorBoundary>
	);
}
