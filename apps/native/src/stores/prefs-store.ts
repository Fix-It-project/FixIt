import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { logger } from "@/src/lib/logger";

const STORAGE_KEY = "fixit_prefs";

/** Clamp range for the in-app text scale (Display settings). */
export const MIN_FONT_SCALE = 0.85;
export const MAX_FONT_SCALE = 1.3;
export const DEFAULT_FONT_SCALE = 1;

interface PrefsState {
	hapticsEnabled: boolean;
	/** In-app text scale multiplier, applied by the shared Text component. */
	fontScale: number;
	/** When true, decorative animations fall back to their resting state. */
	reduceMotion: boolean;
	isLoaded: boolean;
	setHapticsEnabled: (next: boolean) => Promise<void>;
	toggleHaptics: () => void;
	setFontScale: (next: number) => Promise<void>;
	setReduceMotion: (next: boolean) => Promise<void>;
	loadPrefs: () => Promise<void>;
}

function clampFontScale(value: number): number {
	if (Number.isNaN(value)) return DEFAULT_FONT_SCALE;
	return Math.min(MAX_FONT_SCALE, Math.max(MIN_FONT_SCALE, value));
}

export const usePrefsStore = create<PrefsState>((set, get) => ({
	hapticsEnabled: true,
	fontScale: DEFAULT_FONT_SCALE,
	reduceMotion: false,
	isLoaded: false,

	setHapticsEnabled: async (next) => {
		set({ hapticsEnabled: next });
		await persist(get);
	},

	toggleHaptics: () => {
		void get().setHapticsEnabled(!get().hapticsEnabled);
	},

	setFontScale: async (next) => {
		set({ fontScale: clampFontScale(next) });
		await persist(get);
	},

	setReduceMotion: async (next) => {
		set({ reduceMotion: next });
		await persist(get);
	},

	loadPrefs: async () => {
		try {
			const raw = await AsyncStorage.getItem(STORAGE_KEY);
			if (raw) {
				const parsed = JSON.parse(raw) as Partial<{
					hapticsEnabled: boolean;
					fontScale: number;
					reduceMotion: boolean;
				}>;
				set({
					...(typeof parsed.hapticsEnabled === "boolean"
						? { hapticsEnabled: parsed.hapticsEnabled }
						: {}),
					...(typeof parsed.fontScale === "number"
						? { fontScale: clampFontScale(parsed.fontScale) }
						: {}),
					...(typeof parsed.reduceMotion === "boolean"
						? { reduceMotion: parsed.reduceMotion }
						: {}),
				});
			}
			set({ isLoaded: true });
		} catch (error) {
			logger.error("PrefsStore", "Failed to load", error);
			set({ isLoaded: true });
		}
	},
}));

async function persist(get: () => PrefsState): Promise<void> {
	const { hapticsEnabled, fontScale, reduceMotion } = get();
	try {
		await AsyncStorage.setItem(
			STORAGE_KEY,
			JSON.stringify({ hapticsEnabled, fontScale, reduceMotion }),
		);
	} catch (error) {
		logger.error("PrefsStore", "Failed to persist", error);
	}
}
