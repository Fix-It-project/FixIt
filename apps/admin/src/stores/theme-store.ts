import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { themeIds } from "@/lib/theme/definitions";
import type { ThemeId, ThemePreference } from "@/lib/theme/types";

const STORAGE_KEY = "fixit_admin_theme_preference";

interface ThemeState {
	preference: ThemePreference;
	isLoaded: boolean;
	setPreference: (pref: ThemePreference) => void;
	markLoaded: () => void;
}

function isThemePreference(value: unknown): value is ThemePreference {
	if (value === "system") return true;
	return typeof value === "string" && themeIds.includes(value as ThemeId);
}

export const useThemeStore = create<ThemeState>()(
	persist(
		(set) => ({
			preference: "system",
			isLoaded: false,
			setPreference: (preference) => set({ preference }),
			markLoaded: () => set({ isLoaded: true }),
		}),
		{
			name: STORAGE_KEY,
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({ preference: state.preference }),
			onRehydrateStorage: () => (state) => {
				if (state && !isThemePreference(state.preference)) {
					state.preference = "system";
				}
				state?.markLoaded();
			},
		},
	),
);
