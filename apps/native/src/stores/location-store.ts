import * as Location from "expo-location";
import { create } from "zustand";
import { logger } from "@/src/lib/logger";

type LocationPermissionStatus = "undetermined" | "granted" | "denied";

interface LocationState {
	location: { latitude: number; longitude: number } | null;
	permissionStatus: LocationPermissionStatus;
	/** Whether the device's location services (GPS master switch) are turned on. */
	servicesEnabled: boolean;
	/**
	 * Whether the OS will still show the permission prompt. False only when the
	 * user has permanently denied (Android "don't ask again" / iOS denied) — that
	 * is the only case the gate falls back to "Open settings".
	 */
	canAskAgain: boolean;
	/** True once the first status read has completed — gates the initial render. */
	hasChecked: boolean;
	isLoading: boolean;
	/**
	 * Armed when the user taps "Get Started" on welcome while location isn't
	 * satisfied — lets the gate appear over welcome (without it, welcome is the one
	 * screen the gate suppresses). Cleared once we navigate onward.
	 */
	gateArmed: boolean;
	/** Read current services + permission state without prompting (foreground re-checks). */
	checkLocationStatus: () => Promise<void>;
	requestLocationPermission: () => Promise<void>;
	armGate: () => void;
	disarmGate: () => void;
}

function toPermissionStatus(
	status: Location.PermissionStatus,
): LocationPermissionStatus {
	if (status === Location.PermissionStatus.GRANTED) return "granted";
	if (status === Location.PermissionStatus.UNDETERMINED) return "undetermined";
	return "denied";
}

export const useLocationStore = create<LocationState>((set) => ({
	location: null,
	permissionStatus: "undetermined",
	servicesEnabled: false,
	canAskAgain: true,
	hasChecked: false,
	isLoading: false,
	gateArmed: false,

	checkLocationStatus: async () => {
		try {
			const [servicesEnabled, permission] = await Promise.all([
				Location.hasServicesEnabledAsync(),
				Location.getForegroundPermissionsAsync(),
			]);
			set({
				servicesEnabled,
				permissionStatus: toPermissionStatus(permission.status),
				canAskAgain: permission.canAskAgain,
				hasChecked: true,
			});
		} catch (error) {
			logger.error("LocationStore", "Error checking location status", error);
			// Don't trap the user behind a perpetual loading state if the read throws.
			set({ hasChecked: true });
		}
	},

	requestLocationPermission: async () => {
		set({ isLoading: true });
		try {
			const result = await Location.requestForegroundPermissionsAsync();
			// Refresh the GPS master-switch state too, so the gate never acts on stale
			// service state between the prompt and the next foreground re-check.
			const servicesEnabled = await Location.hasServicesEnabledAsync();
			set({ servicesEnabled, canAskAgain: result.canAskAgain });

			if (result.status !== "granted") {
				set({ permissionStatus: "denied", isLoading: false });
				return;
			}

			set({ permissionStatus: "granted" });

			const position = await Location.getCurrentPositionAsync({
				accuracy: Location.Accuracy.Balanced,
			});

			set({
				location: {
					latitude: position.coords.latitude,
					longitude: position.coords.longitude,
				},
			});
		} catch (error) {
			logger.error("LocationStore", "Error getting location", error);
		} finally {
			set({ isLoading: false });
		}
	},

	armGate: () => set({ gateArmed: true }),
	disarmGate: () => set({ gateArmed: false }),
}));

/** The app's hard invariant: device GPS on AND foreground permission granted. */
export const selectIsLocationSatisfied = (state: LocationState): boolean =>
	state.servicesEnabled && state.permissionStatus === "granted";
