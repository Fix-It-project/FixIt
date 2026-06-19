import { useCallback, useEffect } from "react";
import { AppState, type AppStateStatus, Linking } from "react-native";
import { useAuthStore } from "@/src/stores/auth-store";
import {
	selectIsBackgroundLocationSatisfied,
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
	/** Foreground granted (tech only): still need background ("Always"), promptable. */
	| "requestBackground"
	/** Permission permanently denied — only Settings can re-enable it. */
	| "openSettings"
	/** Permission granted but the device GPS master switch is off. */
	| "servicesOff";

/** Root-level guard: drives status reads. Returns whether to show the gate. */
export function useLocationGuard(): { shouldGate: boolean } {
	const checkLocationStatus = useLocationStore((s) => s.checkLocationStatus);
	const hasChecked = useLocationStore((s) => s.hasChecked);
	// Technicians must also hold background ("Always") permission; users don't.
	const requireBackground =
		useAuthStore((s) => s.userType) === "technician";
	const isSatisfied = useLocationStore(
		requireBackground
			? selectIsBackgroundLocationSatisfied
			: selectIsLocationSatisfied,
	);

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
	const servicesEnabled = useLocationStore((s) => s.servicesEnabled);
	const backgroundStatus = useLocationStore((s) => s.backgroundStatus);
	const backgroundCanAskAgain = useLocationStore(
		(s) => s.backgroundCanAskAgain,
	);
	const isLoading = useLocationStore((s) => s.isLoading);
	const requestLocationPermission = useLocationStore(
		(s) => s.requestLocationPermission,
	);
	const requestBackgroundPermission = useLocationStore(
		(s) => s.requestBackgroundPermission,
	);
	const requireBackground =
		useAuthStore((s) => s.userType) === "technician";

	const foregroundSatisfied =
		servicesEnabled && permissionStatus === "granted";
	const isSatisfied =
		foregroundSatisfied &&
		(!requireBackground || backgroundStatus === "granted");

	let status: LocationGateStatus;
	if (isSatisfied) {
		status = "satisfied";
	} else if (permissionStatus !== "granted") {
		// Undetermined / "ask every time" → prompt in-app; else permanently denied.
		status = canAskAgain ? "request" : "openSettings";
	} else if (!servicesEnabled) {
		// Permission fine; the device GPS master switch is off.
		status = "servicesOff";
	} else {
		// Foreground granted + GPS on, but a technician still lacks background.
		status = backgroundCanAskAgain ? "requestBackground" : "openSettings";
	}

	const onPressCta = useCallback(async () => {
		// Only ever prompt in-app; never open Settings on the user's behalf unless
		// permission is permanently denied or the GPS switch is off (both unflippable
		// programmatically). iOS "Allow Once" / declining "Always" falls through to
		// the Settings route via the openSettings status.
		if (status === "request") {
			await requestLocationPermission();
			return;
		}
		if (status === "requestBackground") {
			await requestBackgroundPermission();
			return;
		}
		await Linking.openSettings();
	}, [status, requestLocationPermission, requestBackgroundPermission]);

	return { isSatisfied, status, isLoading, onPressCta };
}
