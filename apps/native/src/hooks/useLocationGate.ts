import { useCallback, useEffect } from "react";
import { AppState, type AppStateStatus, Linking } from "react-native";
import {
	selectIsLocationSatisfied,
	useLocationStore,
} from "@/src/stores/location-store";

/**
 * Mandatory location gate. The app is unusable unless the device's location
 * services are on AND foreground permission is granted.
 *
 * - `useLocationGuard` is mounted once at the root and owns the lifecycle: it
 *   reads status on mount and re-reads whenever the app returns to the
 *   foreground (e.g. the user came back from system Settings). It lives at the
 *   root so we still detect location being turned OFF while the gate is hidden.
 * - `useLocationGate` is the gate screen's brain: it derives the current state
 *   and a single state-aware CTA. It owns no lifecycle.
 */
export type LocationGateStatus =
	| "satisfied"
	/** Permission can still be requested in-app (undetermined or "ask every time"). */
	| "request"
	/** Permission permanently denied — only Settings can re-enable it. */
	| "openSettings"
	/** Permission granted but the device GPS master switch is off. */
	| "servicesOff";

/** Root-level guard: drives status reads. Returns whether to show the gate. */
export function useLocationGuard(): { shouldGate: boolean } {
	const checkLocationStatus = useLocationStore((s) => s.checkLocationStatus);
	const hasChecked = useLocationStore((s) => s.hasChecked);
	const isSatisfied = useLocationStore(selectIsLocationSatisfied);

	useEffect(() => {
		void checkLocationStatus();
		const subscription = AppState.addEventListener(
			"change",
			(state: AppStateStatus) => {
				if (state === "active") void checkLocationStatus();
			},
		);
		return () => subscription.remove();
	}, [checkLocationStatus]);

	// Wait for the first read so already-granted users don't see a one-frame flash.
	return { shouldGate: hasChecked && !isSatisfied };
}

/** Gate-screen brain: current state + the single CTA action. */
export function useLocationGate() {
	const permissionStatus = useLocationStore((s) => s.permissionStatus);
	const canAskAgain = useLocationStore((s) => s.canAskAgain);
	const isLoading = useLocationStore((s) => s.isLoading);
	const isSatisfied = useLocationStore(selectIsLocationSatisfied);
	const requestLocationPermission = useLocationStore(
		(s) => s.requestLocationPermission,
	);

	const status: LocationGateStatus = isSatisfied
		? "satisfied"
		: permissionStatus === "granted"
			? // Permission is fine; the device GPS switch is what's off.
				"servicesOff"
			: canAskAgain
				? // Undetermined or "ask every time" — we can still prompt in-app.
					"request"
				: // Permanently denied — only Settings can re-enable it.
					"openSettings";

	const onPressCta = useCallback(async () => {
		// Only ever prompt in-app; never open Settings on the user's behalf unless
		// permission is permanently denied or the GPS switch is off (both unflippable
		// programmatically). iOS opens the app settings page; the device-wide location
		// services switch lives under system Privacy settings.
		if (status === "request") {
			await requestLocationPermission();
			return;
		}
		await Linking.openSettings();
	}, [status, requestLocationPermission]);

	return { isSatisfied, status, isLoading, onPressCta };
}
