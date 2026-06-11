import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { logger } from "@/src/lib/logger";
import { ROUTES } from "@/src/lib/navigation";
import { useAuthStore } from "@/src/stores/auth-store";
import type { NotificationNavigationPayload } from "../types";

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowBanner: true,
		shouldShowList: true,
		shouldPlaySound: true,
		shouldSetBadge: false,
	}),
});

function normalizePayload(
	data: unknown,
): NotificationNavigationPayload | undefined {
	if (!data || typeof data !== "object") return undefined;
	const payload = data as Record<string, unknown>;
	const orderId =
		typeof payload.orderId === "string" ? payload.orderId : undefined;
	const viewerRole =
		payload.viewerRole === "technician" || payload.viewerRole === "user"
			? payload.viewerRole
			: undefined;
	const type = typeof payload.type === "string" ? payload.type : undefined;
	return { orderId, viewerRole, type };
}

function routeFromPayload(payload: NotificationNavigationPayload): void {
	if (!payload.orderId) return;
	if (payload.viewerRole === "technician") {
		router.push(ROUTES.technician.bookingDetail(payload.orderId));
		return;
	}
	router.push(ROUTES.user.orderDetail(payload.orderId));
}

export function useNotificationRouting(enabled: boolean): void {
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const isLoading = useAuthStore((state) => state.isLoading);
	const handledResponseIdRef = useRef<string | undefined>(undefined);

	useEffect(() => {
		if (!enabled || isLoading) return;

		const handleResponse = (response: Notifications.NotificationResponse) => {
			const responseId = response.notification.request.identifier;
			if (handledResponseIdRef.current === responseId) return;
			handledResponseIdRef.current = responseId;
			const payload = normalizePayload(
				response.notification.request.content.data,
			);
			if (!payload) return;

			// Approval push reaches a logged-out, pending technician — open the
			// verification screen in its approved state (they tap Sign in from there).
			// Skip when already signed in (a stale tap replayed on cold start).
			if (payload.type === "technician_verified") {
				if (isAuthenticated) return;
				logger.info(
					"PushNotifications",
					"Routing approved technician to verification",
				);
				router.replace(
					ROUTES.auth.techVerification({ state: "pending", approved: "true" }),
				);
				return;
			}

			// Rejection push opens the rejected verification screen directly.
			if (payload.type === "technician_rejected") {
				if (isAuthenticated) return;
				logger.info(
					"PushNotifications",
					"Routing rejected technician to verification",
				);
				router.replace(ROUTES.auth.techVerification({ state: "rejected" }));
				return;
			}

			// Everything else (order routing) requires an authenticated session.
			if (!isAuthenticated || !payload.orderId) return;
			logger.info(
				"PushNotifications",
				"Routing from notification tap",
				payload,
			);
			routeFromPayload(payload);
		};

		const subscription =
			Notifications.addNotificationResponseReceivedListener(handleResponse);

		void Notifications.getLastNotificationResponseAsync()
			.then((response) => {
				if (response) {
					handleResponse(response);
				}
			})
			.catch((error) => {
				logger.warn(
					"PushNotifications",
					"Failed to read last notification response",
					{
						error: error instanceof Error ? error.message : String(error),
					},
				);
			});

		return () => {
			subscription.remove();
		};
	}, [enabled, isAuthenticated, isLoading]);
}
