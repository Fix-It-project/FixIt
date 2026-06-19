import type { Href } from "expo-router";

/** Application-lifecycle states the technician verification screen renders. */
export type TechVerificationState = "pending" | "rejected";

/** Account roles the shared Blocked screen serves. */
export type BlockedRole = "user" | "technician";

export const ROUTES = {
	root: "/" as const,

	auth: {
		welcome: "/welcome" as const,
		roleSelection: "/role-selection" as const,
		login: "/login" as const,
		signup: "/signup" as const,
		signupStep2: "/signup/step-2" as const,
		forgotPassword: "/forgot-password" as const,
		resetPassword: "/reset-password" as const,
		techLogin: "/tech-login" as const,
		techSignup: "/tech-signup" as const,
		techSignupStep: (n: 2 | 3 | 4 | 5) => {
			switch (n) {
				case 2: {
					return "/tech-signup/step-2" as const;
				}
				case 3: {
					return "/tech-signup/step-3" as const;
				}
				case 4: {
					return "/tech-signup/step-4" as const;
				}
				default: {
					return "/tech-signup/step-5" as const;
				}
			}
		},
		techVerification: (params: {
			state: TechVerificationState;
			email?: string;
			message?: string;
			approved?: "true";
		}) => ({
			pathname: "/tech-verification" as const,
			params,
		}),
		blocked: (params: {
			role: BlockedRole;
			email?: string;
			message?: string;
			reason?: string;
		}) => ({
			pathname: "/blocked" as const,
			params,
		}),
	},

	user: {
		home: "/user" as const,
		categories: "/user/categories" as const,
		// The Activity tab (Bookings + Reschedule Requests). Replaces the old
		// "My Orders" list tab as the back-to-list target. Order detail
		// routes still live under `/user/orders/...` (see orderDetail).
		activity: "/user/activity" as const,
		orders: "/user/orders" as const,
		orderDetail: (orderId: string) => ({
			pathname: "/user/orders/[orderId]" as const,
			params: { orderId },
		}),
		// Read-only summary for terminal orders (completed / cancelled). Distinct
		// from the live `orderDetail` so finished orders never re-enter the flow.
		orderSummary: (id: string) => ({
			pathname: "/user/orders/summary/[id]" as const,
			params: { id },
		}),
		// Full-page reschedule flow (replaces the old bottom sheet). `technicianId`
		// is forwarded so the page can fetch the technician's public availability.
		reschedule: (orderId: string, technicianId?: string | null) => ({
			pathname: "/user/orders/reschedule/[id]" as const,
			params: { id: orderId, technicianId: technicianId ?? "" },
		}),
		// In-app Paymob checkout (react-native-webview). `url` is the gateway
		// checkout URL returned by the create-card-session mutation.
		paymentCheckout: (url: string) => ({
			pathname: "/user/payment/checkout" as const,
			params: { url },
		}),
		profile: "/user/profile" as const,
		profileEdit: "/user/profile/edit" as const,
		profileAddresses: "/user/profile/addresses" as const,
		profileAddressNew: "/user/profile/addresses/new" as const,
		profileAddressPickLocation: (
			coords?: {
				latitude: number;
				longitude: number;
			},
			// When set, the picker forwards here (with the chosen coords) on confirm
			// instead of popping back — lets "Set on map" open the map FIRST, then
			// land on the form already filled with a location.
			next?: "/user/profile/addresses/new",
		) => ({
			pathname: "/user/profile/addresses/pick-location" as const,
			params: {
				...(coords
					? { lat: String(coords.latitude), lng: String(coords.longitude) }
					: {}),
				...(next ? { next } : {}),
			},
		}),
		profileOrderHistory: "/user/profile/orders/history" as const,
		technicians: "/user/technicians" as const,
		technicianDetail: (id: string) => ({
			pathname: "/user/technician/[id]" as const,
			params: { id },
		}),
		bookingRoot: (technicianId: string) => ({
			pathname: "/user/booking/[technicianId]" as const,
			params: { technicianId },
		}),
		bookingDetails: (technicianId: string) => ({
			pathname: "/user/booking/[technicianId]/details" as const,
			params: { technicianId },
		}),
		recommend: "/user/recommend" as const,
		chat: "/user/chat" as const,
		notifications: "/user/notifications" as const,
		settings: "/user/settings" as const,
		settingsNotifications: "/user/settings/notifications" as const,
		settingsPrivacy: "/user/settings/privacy-security" as const,
		settingsHelp: "/user/settings/help-support" as const,
		settingsDisplay: "/user/settings/display" as const,
		settingsData: "/user/settings/data" as const,
		settingsAbout: "/user/settings/about" as const,
		settingsFaq: "/user/settings/faq" as const,
	},

	technician: {
		home: "/technician" as const,
		schedule: "/technician/schedule" as const,
		// Deep-link into the schedule tab with a specific day preselected
		// (used by "View in schedule" from the Jobs → Scheduled date headers).
		scheduleDay: (date: string) => ({
			pathname: "/technician/schedule" as const,
			params: { date },
		}),
		// First-time onboarding setup + later "Edit schedule" both open this screen.
		scheduleSetup: "/technician/schedule-setup" as const,
		jobs: "/technician/jobs" as const,
		// Deep-link into a specific Jobs tab (e.g. the dashboard reschedule teaser
		// jumps straight to "reschedules").
		jobsTab: (tab: "requests" | "scheduled" | "reschedules") => ({
			pathname: "/technician/jobs" as const,
			params: { tab },
		}),
		bookings: "/technician/bookings" as const,
		bookingDetail: (bookingId: string) => ({
			pathname: "/technician/bookings/[bookingId]" as const,
			params: { bookingId },
		}),
		// Read-only summary for terminal bookings (completed / cancelled). Distinct
		// from the live `bookingDetail` so finished bookings never re-enter the flow.
		bookingSummary: (id: string) => ({
			pathname: "/technician/bookings/summary/[id]" as const,
			params: { id },
		}),
		// Full-page reschedule flow (replaces the old bottom sheet). `technicianId`
		// is the technician's own id, forwarded for the availability fetch.
		reschedule: (bookingId: string, technicianId?: string | null) => ({
			pathname: "/technician/bookings/reschedule/[id]" as const,
			params: { id: bookingId, technicianId: technicianId ?? "" },
		}),
		wallet: "/technician/wallet" as const,
		chat: "/technician/chat" as const,
		notifications: "/technician/notifications" as const,
		profile: "/technician/profile" as const,
		profileEdit: "/technician/profile/edit" as const,
		profileBookingHistory: "/technician/profile/bookings/history" as const,
		settings: "/technician/settings" as const,
		settingsAddress: "/technician/settings/address" as const,
		settingsAddressPickLocation: (coords?: {
			latitude: number;
			longitude: number;
		}) => ({
			pathname: "/technician/settings/pick-location" as const,
			params: coords
				? { lat: String(coords.latitude), lng: String(coords.longitude) }
				: {},
		}),
		settingsServices: "/technician/settings/services" as const,
		settingsNotifications: "/technician/settings/notifications" as const,
		settingsPrivacy: "/technician/settings/privacy-security" as const,
		settingsHelp: "/technician/settings/help-support" as const,
		settingsDisplay: "/technician/settings/display" as const,
		settingsData: "/technician/settings/data" as const,
		settingsAbout: "/technician/settings/about" as const,
		settingsFaq: "/technician/settings/faq" as const,
	},
} as const;

export type AppRoute = Href;
