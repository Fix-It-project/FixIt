/**
 * lifecycle.ts — Phase 4a Plan 04 config constants for the order lifecycle.
 *
 * Keep this file free of runtime imports — it is consumed by the service layer
 * (which itself stays import-light) and by tests.
 */

/**
 * Average urban driving speed (km/h) used to convert order distance into an ETA.
 * Cairo heuristic; tune via Phase 5 if data shows otherwise.
 * Per 04a-CONTEXT.md D17 — eta_minutes = round((distance_km / AVG_SPEED_KMH) * 60).
 */
export const AVG_SPEED_KMH = 25;
