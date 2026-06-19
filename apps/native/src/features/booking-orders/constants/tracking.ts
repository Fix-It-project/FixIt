// Technician live-location tracking configuration.
//
// `TRACKING_MODE` is the single revert switch (see FEATURE_REVERT_GUIDE.md):
//   • "background" — foreground + OS background tracking via expo-task-manager
//     (survives navigation, minimise and OS-relaunch). Requires the native
//     foreground-service / background-location config in app.config.ts.
//   • "foreground" — legacy behaviour: tracking only while the tracking screen
//     is mounted (no Always permission, no foreground service).
export const TRACKING_MODE: "background" | "foreground" = "background";

/** OS task identifier registered via TaskManager.defineTask. */
export const TECH_TRACKING_TASK = "fixit-tech-location-tracking";

/** Minimum distance (metres) moved before the OS delivers a new fix. */
export const TRACK_DISTANCE_M = 200;

/** Lower bound between delivered location batches (ms). */
export const TRACK_INTERVAL_MS = 30_000;

/** AsyncStorage key holding the active tracking order id + arrival flag. The OS
 *  task reads this directly because the in-memory store may be unhydrated when
 *  the task fires after a cold relaunch. */
export const TRACKING_STORAGE_KEY = "fixit_tech_tracking";

/** Data `type` on the arrival local notification — routed by useNotificationRouting. */
export const TECH_ARRIVED_NOTIFICATION_TYPE = "technician_arrived_self";
