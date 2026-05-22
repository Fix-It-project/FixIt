import { useQueryClient } from "@tanstack/react-query";
import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import { postTechLocationPing } from "@/src/features/booking-orders/api/technician-bookings";

export interface UseTechLocationPingOptions {
	readonly orderId: string;
	readonly enabled: boolean;
	readonly intervalMs?: number;
}

export interface UseTechLocationPingResult {
	readonly permissionStatus: "undetermined" | "granted" | "denied";
	readonly canAskAgain: boolean;
	readonly lastPingAt: number | null;
	readonly requestPermission: () => Promise<void>;
}

export function useTechLocationPing({
	orderId,
	enabled,
	intervalMs,
}: UseTechLocationPingOptions): UseTechLocationPingResult {
	const [permissionStatus, setPermissionStatus] = useState<
		"undetermined" | "granted" | "denied"
	>("undetermined");
	const [canAskAgain, setCanAskAgain] = useState(true);
	const [lastPingAt, setLastPingAt] = useState<number | null>(null);

	const inFlightRef = useRef<boolean>(false);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const queryClient = useQueryClient();

	const requestPermission = async (): Promise<void> => {
		const result = await Location.requestForegroundPermissionsAsync();
		setPermissionStatus(result.status === "granted" ? "granted" : "denied");
		setCanAskAgain(result.canAskAgain);
	};

	useEffect(() => {
		if (!enabled || !orderId) return;

		let cancelled = false;

		async function start(): Promise<void> {
			// Read current permission status first.
			let permResult = await Location.getForegroundPermissionsAsync();

			if (permResult.status === "undetermined") {
				// Request permission on first mount.
				permResult = await Location.requestForegroundPermissionsAsync();
			}

			const status = permResult.status === "granted" ? "granted" : "denied";
			if (!cancelled) {
				setPermissionStatus(status);
				setCanAskAgain(permResult.canAskAgain);
			}

			if (status !== "granted") return;

			async function ping(): Promise<void> {
				if (inFlightRef.current || cancelled) return;
				inFlightRef.current = true;
				try {
					const pos = await Location.getCurrentPositionAsync({
						accuracy: Location.Accuracy.Balanced,
						timeInterval: 5_000,
					} as Location.LocationOptions);
					await postTechLocationPing(orderId, {
						latitude: pos.coords.latitude,
						longitude: pos.coords.longitude,
					});
					if (!cancelled) {
						setLastPingAt(Date.now());
						queryClient.invalidateQueries({
							predicate: (q) =>
								q.queryKey[0] === "order-distance" &&
								q.queryKey[2] === orderId,
						});
					}
				} catch {
					// Fire-and-forget — swallow error, retry on next tick.
				} finally {
					inFlightRef.current = false;
				}
			}

			// Immediate first ping.
			await ping();

			if (!cancelled) {
				intervalRef.current = setInterval(ping, intervalMs ?? 30_000);
			}
		}

		void start();

		return () => {
			cancelled = true;
			if (intervalRef.current !== null) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		};
	}, [orderId, enabled, intervalMs, queryClient]);

	return { permissionStatus, canAskAgain, lastPingAt, requestPermission };
}
