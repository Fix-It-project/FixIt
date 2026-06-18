// App-level tracking reconciler, mounted in the technician layout. The screen
// hook (useTechTracking) starts the OS task; this controller STOPS it when no
// order is in `tracking` anymore (e.g. the order completed via push / on
// another device while the tracking screen was unmounted), and surfaces an
// in-app toast when the background arrival notification fires while the app is
// open.

import * as Notifications from "expo-notifications";
import { useEffect, useMemo } from "react";
import { AppState } from "react-native";
import Toast from "react-native-toast-message";
import {
	TECH_ARRIVED_NOTIFICATION_TYPE,
	TRACKING_MODE,
} from "../constants/tracking";
import { stopTechTracking } from "../lib/location-task";
import { useTechnicianBookingsQuery } from "./useTechnicianBookingsQuery";

export function useTechTrackingController(): void {
	const { data: bookings = [] } = useTechnicianBookingsQuery();
	const trackingOrderId = useMemo(
		() => bookings.find((b) => b.status === "tracking")?.id ?? null,
		[bookings],
	);

	// Reconcile: when nothing is in tracking, make sure the OS task is stopped.
	useEffect(() => {
		if (TRACKING_MODE !== "background" || trackingOrderId) return;
		void stopTechTracking();
	}, [trackingOrderId]);

	// Re-check on app foreground — status may have changed remotely while away.
	useEffect(() => {
		if (TRACKING_MODE !== "background") return;
		const sub = AppState.addEventListener("change", (next) => {
			if (next === "active" && !trackingOrderId) void stopTechTracking();
		});
		return () => sub.remove();
	}, [trackingOrderId]);

	// In-app toast backing the background arrival notification.
	useEffect(() => {
		const sub = Notifications.addNotificationReceivedListener((event) => {
			const data = event.request.content.data as { type?: string } | undefined;
			if (data?.type === TECH_ARRIVED_NOTIFICATION_TYPE) {
				Toast.show({
					type: "success",
					text1: "You've arrived",
					text2: "Tap to confirm and start the inspection.",
				});
			}
		});
		return () => sub.remove();
	}, []);
}
