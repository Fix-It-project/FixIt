import { RoleProtectedLayout } from "@/src/components/auth/RoleProtectedLayout";
import { ROUTES } from "@/src/lib/routes";

export default function UserLayout() {
	return (
		<RoleProtectedLayout
			requiredRole="user"
			otherRoleHome={ROUTES.technician.home}
		/>
	);
}
