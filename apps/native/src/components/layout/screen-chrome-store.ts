import { create } from "zustand";

/**
 * The chrome the focused screen wants painted behind the top status-bar inset.
 * A *variant* (not a raw color) so the actual color is resolved against the live
 * theme at render time — a stored hex would go stale across light/dark toggles.
 *
 * - `blue`    — a blue/hero band runs to the top edge (light status-bar icons).
 * - `surface` — the page surface runs to the top edge (theme icons).
 */
export type ScreenChromeVariant = "blue" | "surface";

interface ScreenChromeState {
	topVariant: ScreenChromeVariant;
	setTopVariant: (variant: ScreenChromeVariant) => void;
}

/**
 * Single source of truth for the top-inset chrome. Each screen pushes its
 * variant on focus (via `ScreenStatusBar`) and resets to `surface` on blur, so
 * the shared safe-area frame can paint the top inset to match the current page
 * — no per-route hardcoding, always blended with whatever sits under the bar.
 */
export const useScreenChromeStore = create<ScreenChromeState>((set) => ({
	topVariant: "surface",
	setTopVariant: (topVariant) => set({ topVariant }),
}));
