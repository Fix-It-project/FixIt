import { RoleProtectedLayout } from "@/src/components/auth/RoleProtectedLayout";
import ReviewPromptHost from "@/src/features/reviews/components/user/ReviewPromptHost";
import { ROUTES } from "@/src/lib/routes";

export default function UserLayout() {
	return (
		<RoleProtectedLayout
			requiredRole="user"
			otherRoleHome={ROUTES.technician.home}
			overlay={<ReviewPromptHost />}
		/>
	);
}
