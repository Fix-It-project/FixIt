import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import { create } from "zustand";
import i18n from "@/src/config/i18n";
import {
	DEFAULT_LANGUAGE,
	isSupportedLanguage,
	type Language,
} from "@/src/constants/i18n";
import { applyDirection } from "@/src/lib/i18n/direction";
import { logger } from "@/src/lib/logger";

const STORAGE_KEY = "fixit_language_preference";

function resolveDeviceLanguage(): Language {
	const code = Localization.getLocales()[0]?.languageCode;
	return isSupportedLanguage(code) ? code : DEFAULT_LANGUAGE;
}

interface LanguageState {
	language: Language;
	isLoaded: boolean;
	setLanguage: (language: Language) => Promise<void>;
	loadLanguagePreference: () => Promise<void>;
}

export const useLanguageStore = create<LanguageState>((set) => ({
	language: DEFAULT_LANGUAGE,
	isLoaded: false,

	setLanguage: async (language) => {
		set({ language });
		try {
			await AsyncStorage.setItem(STORAGE_KEY, language);
		} catch (error) {
			logger.error("LanguageStore", "Failed to persist language", error);
		}
		await i18n.changeLanguage(language);
		// Reloads the app when the text direction flips (LTR <-> RTL).
		await applyDirection(language);
	},

	loadLanguagePreference: async () => {
		try {
			const stored = await AsyncStorage.getItem(STORAGE_KEY);
			const language = isSupportedLanguage(stored)
				? stored
				: resolveDeviceLanguage();
			await i18n.changeLanguage(language);
			await applyDirection(language);
			set({ language, isLoaded: true });
		} catch (error) {
			logger.error("LanguageStore", "Failed to load language", error);
			set({ isLoaded: true });
		}
	},
}));
