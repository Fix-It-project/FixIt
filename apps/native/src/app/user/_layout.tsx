import { RoleProtectedLayout } from "@/src/components/auth/RoleProtectedLayout";
import { useActorOrdersRealtime } from "@/src/features/booking-orders/hooks/useActorOrdersRealtime";
import ReviewPromptHost from "@/src/features/reviews/components/user/ReviewPromptHost";
import { ROUTES } from "@/src/lib/routes";
import { useAuthStore } from "@/src/stores/auth-store";

export default function UserLayout() {
	const userId = useAuthStore((s) => s.user?.id);
	useActorOrdersRealtime("user", userId);

	return (
		<RoleProtectedLayout
			requiredRole="user"
			otherRoleHome={ROUTES.technician.home}
			overlay={<ReviewPromptHost />}
		/>
	);
}
