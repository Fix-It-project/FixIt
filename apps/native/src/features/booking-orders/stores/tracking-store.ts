// Persisted tracking state shared between React UI and the headless OS location
// task. AsyncStorage is the source of truth (the task can fire before the
// in-memory store hydrates after a cold relaunch); the zustand store mirrors it
// for any UI consumer.

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { logger } from "@/src/lib/logger";
import { TRACKING_STORAGE_KEY } from "../constants/tracking";

export interface TrackingState {
	/** Order currently being tracked, or null when idle. */
	activeTrackingOrderId: string | null;
	/** True once the "you've arrived" notification has fired for this order. */
	arrivalNotified: boolean;
}

const DEFAULT_STATE: TrackingState = {
	activeTrackingOrderId: null,
	arrivalNotified: false,
};

interface TrackingStore extends TrackingState {
	/** Hydrate the in-memory mirror from AsyncStorage (call once on app start). */
	hydrate: () => Promise<void>;
}

export const useTrackingStore = create<TrackingStore>((set) => ({
	...DEFAULT_STATE,
	hydrate: async () => {
		set(await readTracking());
	},
}));

/** Read the persisted tracking state directly (safe inside the headless task). */
export async function readTracking(): Promise<TrackingState> {
	try {
		const raw = await AsyncStorage.getItem(TRACKING_STORAGE_KEY);
		if (raw) {
			const parsed = JSON.parse(raw) as Partial<TrackingState>;
			return {
				activeTrackingOrderId:
					typeof parsed.activeTrackingOrderId === "string"
						? parsed.activeTrackingOrderId
						: null,
				arrivalNotified: parsed.arrivalNotified === true,
			};
		}
	} catch (error) {
		logger.error("TechTracking", "Failed to read tracking state", error);
	}
	return { ...DEFAULT_STATE };
}

async function writeTracking(next: TrackingState): Promise<void> {
	try {
		await AsyncStorage.setItem(TRACKING_STORAGE_KEY, JSON.stringify(next));
	} catch (error) {
		logger.error("TechTracking", "Failed to persist tracking state", error);
	}
	useTrackingStore.setState(next);
}

/** Point tracking at `orderId`; resets the arrival flag when switching orders. */
export async function setActiveTrackingOrder(orderId: string): Promise<void> {
	const current = await readTracking();
	await writeTracking({
		activeTrackingOrderId: orderId,
		arrivalNotified:
			current.activeTrackingOrderId === orderId
				? current.arrivalNotified
				: false,
	});
}

export async function markArrivalNotified(): Promise<void> {
	const current = await readTracking();
	await writeTracking({ ...current, arrivalNotified: true });
}

export async function clearActiveTracking(): Promise<void> {
	await writeTracking({ ...DEFAULT_STATE });
}
