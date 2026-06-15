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
		orders: "/user/orders" as const,
		orderDetail: (orderId: string) => ({
			pathname: "/user/orders/[orderId]" as const,
			params: { orderId },
		}),
		placedOrder: (id: string) => ({
			pathname: "/user/orders/placed/[id]" as const,
			params: { id },
		}),
		profile: "/user/profile" as const,
		profileEdit: "/user/profile/edit" as const,
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
	},

	technician: {
		home: "/technician" as const,
		schedule: "/technician/schedule" as const,
		bookings: "/technician/bookings" as const,
		bookingDetail: (bookingId: string) => ({
			pathname: "/technician/bookings/[bookingId]" as const,
			params: { bookingId },
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
	},
} as const;

export type AppRoute = Href;
