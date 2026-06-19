// Focused foreground geofence for the technician "I've arrived" button.
//
// This is the FAST path that unblurs the arrived CTA within ~1–2s, decoupled
// from the 30s `useOrderDistance` poll. It is separate from the background OS
// task (which batches at TRACK_DISTANCE_M / TRACK_INTERVAL_MS and is not a
// 1–2s signal). The watcher is mounted only while the tracking screen is
// focused and is torn down on blur/unmount (no battery leak).
//
// IMPORTANT — UI-enable ≠ backend-ready. Enabling the button locally does not
// set the server's `arrived_at`; `tech_start_inspection` requires a real arrival
// event ≤1km. So when the local geofence first flips true we immediately POST a
// foreground location ping (seeding `arrived_at`), and `confirmArrival()` posts
// one more fresh ping before the caller fires `techMarkArrived`.

import * as Location from "expo-location";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { postTechLocationPing } from "@/src/features/booking-orders/api/technician-bookings";

/** Matches the server arrival threshold (lifecycle README: `<= 1km`). */
const ARRIVAL_GEOFENCE_KM = 1.0;
const EARTH_RADIUS_KM = 6371;

export interface ArrivalDestination {
	readonly latitude: number;
	readonly longitude: number;
}

export interface UseArrivalGeofenceOptions {
	readonly orderId: string;
	readonly destination: ArrivalDestination | null;
	/** True while the order is in the `tracking` stage and the screen is shown. */
	readonly active: boolean;
}

export interface UseArrivalGeofenceResult {
	/** True when the device is within the arrival radius of the destination. */
	readonly withinGeofence: boolean;
	/** Posts a fresh location ping so the server registers arrival before the
	 *  caller marks the order arrived. Best-effort — never throws. */
	readonly confirmArrival: () => Promise<void>;
}

function toRad(deg: number): number {
	return (deg * Math.PI) / 180;
}

function haversineKm(a: ArrivalDestination, b: ArrivalDestination): number {
	const dLat = toRad(b.latitude - a.latitude);
	const dLng = toRad(b.longitude - a.longitude);
	const lat1 = toRad(a.latitude);
	const lat2 = toRad(b.latitude);
	const h =
		Math.sin(dLat / 2) ** 2 +
		Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
	return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function useArrivalGeofence({
	orderId,
	destination,
	active,
}: UseArrivalGeofenceOptions): UseArrivalGeofenceResult {
	const [withinGeofence, setWithinGeofence] = useState(false);
	const lastCoordsRef = useRef<ArrivalDestination | null>(null);
	// Guards the one-shot seed ping so we don't spam the endpoint every fix.
	const seededRef = useRef(false);

	const destLat = destination?.latitude ?? null;
	const destLng = destination?.longitude ?? null;

	useFocusEffect(
		useCallback(() => {
			if (!active || !orderId || destLat === null || destLng === null) {
				return;
			}

			let cancelled = false;
			let subscription: Location.LocationSubscription | null = null;
			const dest: ArrivalDestination = {
				latitude: destLat,
				longitude: destLng,
			};

			async function start(): Promise<void> {
				const perm = await Location.getForegroundPermissionsAsync();
				// The tracking hook owns the permission prompt; if not granted we
				// silently skip and the 30s poll remains the failover.
				if (perm.status !== "granted" || cancelled) return;

				subscription = await Location.watchPositionAsync(
					{
						accuracy: Location.Accuracy.High,
						distanceInterval: 25,
						timeInterval: 4_000,
					},
					(pos) => {
						const coords: ArrivalDestination = {
							latitude: pos.coords.latitude,
							longitude: pos.coords.longitude,
						};
						lastCoordsRef.current = coords;
						const inside = haversineKm(coords, dest) <= ARRIVAL_GEOFENCE_KM;
						setWithinGeofence(inside);
						if (inside) {
							if (!seededRef.current) {
								seededRef.current = true;
								// Seed server `arrived_at` the moment we cross the radius.
								void postTechLocationPing(orderId, coords).catch(() => {});
							}
						} else {
							seededRef.current = false;
						}
					},
				);

				if (cancelled) {
					subscription?.remove();
					subscription = null;
				}
			}

			void start();

			return () => {
				cancelled = true;
				subscription?.remove();
				subscription = null;
				setWithinGeofence(false);
			};
		}, [orderId, active, destLat, destLng]),
	);

	const confirmArrival = useCallback(async () => {
		let coords = lastCoordsRef.current;
		try {
			const pos = await Location.getCurrentPositionAsync({
				accuracy: Location.Accuracy.High,
			});
			coords = {
				latitude: pos.coords.latitude,
				longitude: pos.coords.longitude,
			};
		} catch {
			// Fall back to the last watched fix.
		}
		if (!coords) return;
		try {
			await postTechLocationPing(orderId, coords);
		} catch {
			// Best-effort — the seed ping may already have set arrived_at, and the
			// caller's techMarkArrived will surface any real failure.
		}
	}, [orderId]);

	return { withinGeofence, confirmArrival };
}
