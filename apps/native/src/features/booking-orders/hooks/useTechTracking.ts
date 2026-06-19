// Tracking-screen hook. In background mode it ensures the OS task is streaming
// this order's location and exposes foreground-permission state for the UI
// prompt; in foreground mode it delegates to the legacy in-component pinger.

import * as Location from "expo-location";
import { useCallback, useEffect, useState } from "react";
import { TRACKING_MODE } from "../constants/tracking";
import { startTechTracking } from "../lib/location-task";
import { useTechLocationPing } from "./useTechLocationPing";

export interface UseTechTrackingResult {
	readonly permissionStatus: "undetermined" | "granted" | "denied";
	readonly canAskAgain: boolean;
	readonly requestPermission: () => Promise<void>;
}

export interface UseTechTrackingOptions {
	readonly orderId: string;
	/** True while the order is in the `tracking` stage. */
	readonly active: boolean;
}

export function useTechTracking({
	orderId,
	active,
}: UseTechTrackingOptions): UseTechTrackingResult {
	const isBackground = TRACKING_MODE === "background";

	// Foreground fallback: the legacy pinger owns everything when not background.
	const foregroundPing = useTechLocationPing({
		orderId,
		enabled: !isBackground && active,
	});

	const [permissionStatus, setPermissionStatus] = useState<
		"undetermined" | "granted" | "denied"
	>("undetermined");
	const [canAskAgain, setCanAskAgain] = useState(true);

	const refreshPermission = useCallback(async () => {
		const result = await Location.getForegroundPermissionsAsync();
		setPermissionStatus(
			result.status === "granted"
				? "granted"
				: result.status === "denied"
					? "denied"
					: "undetermined",
		);
		setCanAskAgain(result.canAskAgain);
	}, []);

	const requestPermission = useCallback(async () => {
		const result = await Location.requestForegroundPermissionsAsync();
		setPermissionStatus(result.status === "granted" ? "granted" : "denied");
		setCanAskAgain(result.canAskAgain);
		if (result.status === "granted" && active) {
			await startTechTracking(orderId);
		}
	}, [active, orderId]);

	useEffect(() => {
		if (!isBackground) return;
		void refreshPermission();
	}, [isBackground, refreshPermission]);

	// Ensure the OS task is running whenever this order is in the tracking stage.
	useEffect(() => {
		if (!isBackground || !active || !orderId) return;
		void startTechTracking(orderId).then(refreshPermission);
	}, [isBackground, active, orderId, refreshPermission]);

	if (!isBackground) return foregroundPing;
	return { permissionStatus, canAskAgain, requestPermission };
}
