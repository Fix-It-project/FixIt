import { RoleProtectedLayout } from "@/src/components/auth/RoleProtectedLayout";
import { ROUTES } from "@/src/lib/routes";

export default function TechnicianLayout() {
	return (
		<RoleProtectedLayout
			requiredRole="technician"
			otherRoleHome={ROUTES.user.home}
		/>
	);
}
