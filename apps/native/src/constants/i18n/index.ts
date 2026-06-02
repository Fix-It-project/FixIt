import arCommon from "./locales/ar/common.json";
import arHome from "./locales/ar/home.json";
import enCommon from "./locales/en/common.json";
import enHome from "./locales/en/home.json";

/**
 * Centralized i18n resources. English is the source of truth (and the shape
 * used for TypeScript key-safety in `lib/i18n/react-i18next.d.ts`). Arabic is
 * synced from locize via the `i18n:download` script — see CLAUDE onboarding.
 */
export const SUPPORTED_LANGUAGES = ["en", "ar"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: Language = "en";

export const defaultNS = "common" as const;
export const namespaces = ["common", "home"] as const;

export const resources = {
	en: { common: enCommon, home: enHome },
	ar: { common: arCommon, home: arHome },
} as const;

export function isSupportedLanguage(
	value: string | null | undefined,
): value is Language {
	return value != null && (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}
