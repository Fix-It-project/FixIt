import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { themeIds } from "@/src/lib/theme/definitions";
import type { ThemeId, ThemePreference } from "@/src/lib/theme/types";

const STORAGE_KEY = "fixit_theme_preference";

interface ThemeState {
	preference: ThemePreference;
	isLoaded: boolean;
	setPreference: (pref: ThemePreference) => Promise<void>;
	loadThemePreference: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set) => ({
	preference: "system",
	isLoaded: false,

	setPreference: async (preference) => {
		set({ preference });
		try {
			await AsyncStorage.setItem(STORAGE_KEY, preference);
		} catch (error) {
			console.error("[ThemeStore] Failed to persist preference:", error);
		}
	},

	loadThemePreference: async () => {
		try {
			const stored = await AsyncStorage.getItem(STORAGE_KEY);
			if (stored === "system" || themeIds.includes(stored as ThemeId)) {
				set({ preference: stored as ThemePreference, isLoaded: true });
			} else {
				set({ isLoaded: true });
			}
		} catch (error) {
			console.error("[ThemeStore] Failed to load preference:", error);
			set({ isLoaded: true });
		}
	},
}));
