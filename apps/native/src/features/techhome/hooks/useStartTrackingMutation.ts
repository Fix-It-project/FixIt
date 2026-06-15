import { useMutation } from "@tanstack/react-query";
import { startTracking } from "../api/tech-home";
import { useInvalidateOrderCaches } from "./useOrderActionMutations";

/**
 * Start tracking an accepted order from the home screen. On success the shared
 * order caches are invalidated (same set as accept/decline) — the order flips to
 * `tracking`, so the primary slot re-derives into the active-job card.
 *
 * `techHomeKeys.orders` (["technician-bookings"]) already invalidates the
 * ["technician-bookings", userId] family by prefix, so no per-user key is needed.
 */
export function useStartTrackingMutation() {
	const invalidate = useInvalidateOrderCaches();
	return useMutation({
		mutationFn: (orderId: string) => startTracking(orderId),
		onSuccess: invalidate,
	});
}
