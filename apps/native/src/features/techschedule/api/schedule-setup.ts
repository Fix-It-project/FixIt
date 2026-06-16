import apiClient from "@/src/config/api-client";

/**
 * Stamp first-time schedule-setup completion. Idempotent server-side — the
 * timestamp is only set the first time, so onboarding never re-appears (even if
 * the technician later saves zero working days).
 */
export async function completeScheduleSetup(): Promise<void> {
	await apiClient.post("/api/technicians/me/schedule-setup-complete");
}
