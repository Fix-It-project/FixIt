import { env } from "@FixIt/env/native";
import i18n from "i18next";
import LocizeBackend from "i18next-locize-backend";
import { initReactI18next } from "react-i18next";
import {
	DEFAULT_LANGUAGE,
	defaultNS,
	namespaces,
	resources,
} from "@/src/constants/i18n";

/**
 * i18next setup (side-effect singleton — imported once in app/_layout.tsx,
 * mirroring config/monitoring.ts).
 *
 * Hybrid strategy:
 * - Production ships the bundled `resources` (offline-first, no API key).
 * - In `__DEV__`, when a locize project id is present, we additionally attach
 *   the locize backend with `saveMissing` so any new `t("key")` is pushed to
 *   locize and live translations overlay the bundled JSON
 *   (`partialBundledLanguages`). The API key must NEVER be set in a production
 *   build env — it is dev/CI only.
 *
 * NOTE: locize's in-context editor (`locizePlugin`) is intentionally NOT used —
 * it is a browser-only tool that manipulates `window`/`document` and crashes
 * under React Native (Hermes). Only the HTTP backend is RN-safe.
 *
 * The initial language is `DEFAULT_LANGUAGE`; the language store calls
 * `i18n.changeLanguage()` during bootstrap once the persisted/device locale is
 * resolved (see stores/language-store.ts).
 */
const locizeProjectId = env.EXPO_PUBLIC_LOCIZE_PROJECT_ID;
const locizeApiKey = env.EXPO_PUBLIC_LOCIZE_API_KEY;
const useLocize = __DEV__ && Boolean(locizeProjectId);

const instance = i18n.use(initReactI18next);

if (useLocize) {
	instance.use(LocizeBackend);
}

void instance.init({
	lng: DEFAULT_LANGUAGE,
	fallbackLng: DEFAULT_LANGUAGE,
	defaultNS,
	ns: [...namespaces],
	resources,
	interpolation: { escapeValue: false },
	react: { useSuspense: false },
	...(useLocize
		? {
				partialBundledLanguages: true,
				saveMissing: true,
				backend: {
					projectId: locizeProjectId as string,
					apiKey: locizeApiKey,
					referenceLng: DEFAULT_LANGUAGE,
				},
			}
		: {}),
});

export default i18n;
