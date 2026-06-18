// Background technician location tracking.
//
// `TaskManager.defineTask` runs at module scope so the task is registered on
// every JS launch — including the headless launch the OS performs to deliver a
// background fix. This module is imported once for its side effect from the
// root layout (app/_layout.tsx).
//
// The task posts each fix to the backend, then reacts to the response:
//   • `arrived === true` → fire the one-shot "you've arrived" local notification.
//   • order no longer in `tracking` → stop the OS updates.
//
// iOS note: the OS keeps delivering while the app is backgrounded/suspended and
// can relaunch it, but a user force-quit ends the task (platform limitation).

import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import { logger } from "@/src/lib/logger";
import { postTechLocationPing } from "../api/technician-bookings";
import {
	TECH_ARRIVED_NOTIFICATION_TYPE,
	TECH_TRACKING_TASK,
	TRACK_DISTANCE_M,
	TRACK_INTERVAL_MS,
	TRACKING_MODE,
} from "../constants/tracking";
import {
	clearActiveTracking,
	markArrivalNotified,
	readTracking,
	setActiveTrackingOrder,
} from "../stores/tracking-store";

interface LocationTaskData {
	locations?: Location.LocationObject[];
}

async function isTaskRunning(): Promise<boolean> {
	try {
		return await Location.hasStartedLocationUpdatesAsync(TECH_TRACKING_TASK);
	} catch {
		return false;
	}
}

async function notifyArrival(orderId: string): Promise<void> {
	try {
		await Notifications.scheduleNotificationAsync({
			content: {
				title: "You've arrived",
				body: "Tap to confirm arrival and start the inspection.",
				data: {
					orderId,
					viewerRole: "technician",
					type: TECH_ARRIVED_NOTIFICATION_TYPE,
				},
			},
			trigger: null,
		});
	} catch (error) {
		logger.warn("TechTracking", "Failed to schedule arrival notification", {
			error: String(error),
		});
	}
}

TaskManager.defineTask(TECH_TRACKING_TASK, async ({ data, error }) => {
	if (error) {
		logger.error("TechTracking", "Location task error", error);
		return;
	}
	const locations = (data as LocationTaskData)?.locations;
	if (!locations?.length) return;

	const state = await readTracking();
	const orderId = state.activeTrackingOrderId;
	if (!orderId) {
		// Nothing to track — make sure the OS isn't still delivering fixes.
		await stopTechTracking();
		return;
	}

	const last = locations[locations.length - 1];
	const { latitude, longitude, heading, accuracy } = last.coords;
	try {
		const ping = await postTechLocationPing(orderId, {
			latitude,
			longitude,
			// expo reports heading as -1 when unavailable.
			...(typeof heading === "number" && heading >= 0 ? { heading } : {}),
			...(typeof accuracy === "number" ? { accuracy } : {}),
		});
		const body = (ping?.data ?? {}) as {
			arrived?: boolean;
			order?: { status?: string };
		};
		if (body.arrived === true && !state.arrivalNotified) {
			await markArrivalNotified();
			await notifyArrival(orderId);
		}
		const status = body.order?.status;
		if (status && status !== "tracking") {
			// Order moved on (arrived / cancelled / completed) — stop tracking.
			await stopTechTracking();
		}
	} catch (pingError) {
		// Fire-and-forget: swallow and retry on the next delivered fix.
		logger.warn("TechTracking", "Location ping failed", {
			error: String(pingError),
		});
	}
});

/**
 * Ensure the OS is streaming this order's location. Idempotent: if already
 * running it only repoints the active order (no permission re-prompt).
 */
export async function startTechTracking(orderId: string): Promise<void> {
	if (TRACKING_MODE !== "background") return;

	if (await isTaskRunning()) {
		await setActiveTrackingOrder(orderId);
		return;
	}

	const foreground = await Location.requestForegroundPermissionsAsync();
	if (foreground.status !== "granted") {
		logger.warn("TechTracking", "Foreground location permission not granted");
		return;
	}
	// Background permission keeps tracking alive when minimised / suspended.
	await Location.requestBackgroundPermissionsAsync();

	await setActiveTrackingOrder(orderId);
	try {
		await Location.startLocationUpdatesAsync(TECH_TRACKING_TASK, {
			accuracy: Location.Accuracy.Balanced,
			distanceInterval: TRACK_DISTANCE_M,
			deferredUpdatesInterval: TRACK_INTERVAL_MS,
			pausesUpdatesAutomatically: false,
			showsBackgroundLocationIndicator: true,
			foregroundService: {
				notificationTitle: "Sharing your live location",
				notificationBody:
					"FixIt is sharing your location with the customer until you arrive.",
			},
		});
	} catch (error) {
		logger.error("TechTracking", "Failed to start location updates", error);
		await clearActiveTracking();
	}
}

/** Stop OS updates and clear the active order. Cheap no-op when already idle. */
export async function stopTechTracking(): Promise<void> {
	const running = await isTaskRunning();
	const state = await readTracking();
	if (!running && !state.activeTrackingOrderId) return;

	await clearActiveTracking();
	if (running) {
		try {
			await Location.stopLocationUpdatesAsync(TECH_TRACKING_TASK);
		} catch (error) {
			logger.warn("TechTracking", "Failed to stop location updates", {
				error: String(error),
			});
		}
	}
}
