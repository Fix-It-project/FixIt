import { create } from "zustand";

export interface PickedCoords {
	latitude: number;
	longitude: number;
}

interface PickedLocationState {
	/** Coords chosen on the map, awaiting pickup by the form that opened the picker. */
	coords: PickedCoords | null;
	setCoords: (coords: PickedCoords) => void;
	clear: () => void;
}

/**
 * Transient handoff between the map picker and the address form. The picker
 * writes the chosen coords + `router.back()`s; the form adopts them on focus
 * and immediately `clear()`s. Ephemeral UI state — never server data.
 */
export const usePickedLocationStore = create<PickedLocationState>((set) => ({
	coords: null,
	setCoords: (coords) => set({ coords }),
	clear: () => set({ coords: null }),
}));
