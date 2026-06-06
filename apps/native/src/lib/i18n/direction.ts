import * as Updates from "expo-updates";
import { Alert, DevSettings, I18nManager } from "react-native";
import type { Language } from "@/src/constants/i18n";
import { logger } from "@/src/lib/logger";

/** Languages that render right-to-left. */
export function isRTLLanguage(lang: Language): boolean {
	return lang === "ar";
}

/**
 * Reload the app so a layout-direction change takes effect. `I18nManager`
 * direction only applies after a fresh JS/native reload — this is a hard React
 * Native constraint. Prefer `expo-updates`; fall back to the dev fast-reload;
 * last resort, ask the user to restart manually.
 */
async function reloadApp(): Promise<void> {
	try {
		await Updates.reloadAsync();
		return;
	} catch {
		// expo-updates is unavailable in Expo Go / non-update builds — fall through.
	}

	if (typeof DevSettings?.reload === "function") {
		DevSettings.reload();
		return;
	}

	Alert.alert(
		"Restart required",
		"Please close and reopen the app to apply the new language direction.",
	);
}

/**
 * Apply the layout direction for `lang`. No-ops (and does not reload) when the
 * current direction already matches — so switching between same-direction
 * languages, or re-applying on startup, is free.
 */
export async function applyDirection(lang: Language): Promise<void> {
	const shouldRTL = isRTLLanguage(lang);
	if (I18nManager.isRTL === shouldRTL) {
		return;
	}

	try {
		I18nManager.allowRTL(shouldRTL);
		I18nManager.forceRTL(shouldRTL);
	} catch (error) {
		logger.error("i18n", "Failed to set layout direction", error);
		return;
	}

	await reloadApp();
}
