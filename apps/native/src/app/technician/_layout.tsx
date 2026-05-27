import { RoleProtectedLayout } from "@/src/components/auth/RoleProtectedLayout";
import { RouteErrorBoundary } from "@/src/lib/errors/error-boundary";
import { ROUTES } from "@/src/lib/routes";

export default function TechnicianLayout() {
	return (
		<RouteErrorBoundary>
			<RoleProtectedLayout
				requiredRole="technician"
				otherRoleHome={ROUTES.user.home}
			/>
		</RouteErrorBoundary>
	);
}
