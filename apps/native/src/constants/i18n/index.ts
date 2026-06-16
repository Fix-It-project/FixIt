import arAddresses from "./locales/ar/addresses.json";
import arBooking from "./locales/ar/booking.json";
import arCategories from "./locales/ar/categories.json";
import arChat from "./locales/ar/chat.json";
import arCommon from "./locales/ar/common.json";
import arFaq from "./locales/ar/faq.json";
import arHome from "./locales/ar/home.json";
import arLocation from "./locales/ar/location.json";
import arNotifications from "./locales/ar/notifications.json";
import arOrders from "./locales/ar/orders.json";
import arProfile from "./locales/ar/profile.json";
import arReports from "./locales/ar/reports.json";
import arReviews from "./locales/ar/reviews.json";
import arSettings from "./locales/ar/settings.json";
import arTechnician from "./locales/ar/technician.json";
import arTechnicians from "./locales/ar/technicians.json";
import enAddresses from "./locales/en/addresses.json";
import enBooking from "./locales/en/booking.json";
import enCategories from "./locales/en/categories.json";
import enChat from "./locales/en/chat.json";
import enCommon from "./locales/en/common.json";
import enFaq from "./locales/en/faq.json";
import enHome from "./locales/en/home.json";
import enLocation from "./locales/en/location.json";
import enNotifications from "./locales/en/notifications.json";
import enOrders from "./locales/en/orders.json";
import enProfile from "./locales/en/profile.json";
import enReports from "./locales/en/reports.json";
import enReviews from "./locales/en/reviews.json";
import enSettings from "./locales/en/settings.json";
import enTechnician from "./locales/en/technician.json";
import enTechnicians from "./locales/en/technicians.json";

/**
 * Centralized i18n resources. English is the source of truth (and the shape
 * used for TypeScript key-safety in `lib/i18n/react-i18next.d.ts`). Arabic is
 * synced from locize via the `i18n:download` script — see CLAUDE onboarding.
 */
export const SUPPORTED_LANGUAGES = ["en", "ar"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: Language = "en";

export const defaultNS = "common" as const;
export const namespaces = [
	"common",
	"home",
	"booking",
	"technicians",
	"technician",
	"categories",
	"orders",
	"profile",
	"settings",
	"notifications",
	"reviews",
	"reports",
	"chat",
	"addresses",
	"location",
	"faq",
] as const;

export const resources = {
	en: {
		common: enCommon,
		home: enHome,
		booking: enBooking,
		technicians: enTechnicians,
		technician: enTechnician,
		categories: enCategories,
		orders: enOrders,
		profile: enProfile,
		settings: enSettings,
		notifications: enNotifications,
		reviews: enReviews,
		reports: enReports,
		chat: enChat,
		addresses: enAddresses,
		location: enLocation,
		faq: enFaq,
	},
	ar: {
		common: arCommon,
		home: arHome,
		booking: arBooking,
		technicians: arTechnicians,
		technician: arTechnician,
		categories: arCategories,
		orders: arOrders,
		profile: arProfile,
		settings: arSettings,
		notifications: arNotifications,
		reviews: arReviews,
		reports: arReports,
		chat: arChat,
		addresses: arAddresses,
		location: arLocation,
		faq: arFaq,
	},
} as const;

export function isSupportedLanguage(
	value: string | null | undefined,
): value is Language {
	return (
		value != null && (SUPPORTED_LANGUAGES as readonly string[]).includes(value)
	);
}
