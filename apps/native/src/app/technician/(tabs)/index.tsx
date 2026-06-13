import { TechHomeScreen } from "@/src/features/techhome";

// New technician dashboard (techhome feature). The previous home composition
// (features/dashboard + tech-self DashboardHeader) is preserved on disk —
// revert by restoring the old imports here.
export default function TechHome() {
	return <TechHomeScreen />;
}
