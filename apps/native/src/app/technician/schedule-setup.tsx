import { ScheduleSetup } from "@/src/features/techschedule/components/ScheduleSetup";

/**
 * Schedule setup / edit screen — opened by first-run onboarding and by the
 * "Edit" button on the schedule page (no modal). Saving stamps setup complete
 * so onboarding never returns.
 */
export default function ScheduleSetupRoute() {
	return <ScheduleSetup />;
}
