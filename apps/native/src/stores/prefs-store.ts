import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const STORAGE_KEY = "fixit_prefs";

interface PrefsState {
	hapticsEnabled: boolean;
	isLoaded: boolean;
	setHapticsEnabled: (next: boolean) => Promise<void>;
	toggleHaptics: () => void;
	loadPrefs: () => Promise<void>;
}

export const usePrefsStore = create<PrefsState>((set, get) => ({
	hapticsEnabled: true,
	isLoaded: false,

	setHapticsEnabled: async (next) => {
		set({ hapticsEnabled: next });
		try {
			await AsyncStorage.setItem(
				STORAGE_KEY,
				JSON.stringify({ hapticsEnabled: next }),
			);
		} catch (error) {
			console.error("[PrefsStore] Failed to persist:", error);
		}
	},

	toggleHaptics: () => {
		const next = !get().hapticsEnabled;
		get().setHapticsEnabled(next);
	},

	loadPrefs: async () => {
		try {
			const raw = await AsyncStorage.getItem(STORAGE_KEY);
			if (raw) {
				const parsed: unknown = JSON.parse(raw);
				if (
					parsed !== null &&
					typeof parsed === "object" &&
					"hapticsEnabled" in parsed &&
					typeof (parsed as Record<string, unknown>).hapticsEnabled ===
						"boolean"
				) {
					set({
						hapticsEnabled: (parsed as { hapticsEnabled: boolean })
							.hapticsEnabled,
					});
				}
			}
			set({ isLoaded: true });
		} catch (error) {
			console.error("[PrefsStore] Failed to load:", error);
			set({ isLoaded: true });
		}
	},
}));
