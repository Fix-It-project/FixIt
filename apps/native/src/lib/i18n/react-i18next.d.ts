import "react-i18next";
import type { defaultNS, resources } from "@/src/constants/i18n";

/**
 * Type-safe translation keys: `t("...")` autocompletes and rejects typos
 * against the English resource shape (source of truth).
 */
declare module "react-i18next" {
	interface CustomTypeOptions {
		defaultNS: typeof defaultNS;
		resources: (typeof resources)["en"];
	}
}
