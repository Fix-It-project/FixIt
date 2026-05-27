import { beforeEach, describe, expect, it, vi } from "vitest";

// Hoist mock refs so vi.mock factory can reference them safely
const { mockGetItem, mockSetItem } = vi.hoisted(() => ({
	mockGetItem: vi.fn(),
	mockSetItem: vi.fn(),
}));

vi.mock("@react-native-async-storage/async-storage", () => ({
	default: {
		getItem: mockGetItem,
		setItem: mockSetItem,
	},
}));

import { usePrefsStore } from "../prefs-store";

describe("prefs-store", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Reset store to initial defaults before each test
		usePrefsStore.setState({ hapticsEnabled: true, isLoaded: false });
	});

	it("default state: hapticsEnabled is true", () => {
		const state = usePrefsStore.getState();
		expect(state.hapticsEnabled).toBe(true);
	});

	it("default state: isLoaded is false", () => {
		const state = usePrefsStore.getState();
		expect(state.isLoaded).toBe(false);
	});

	it("setHapticsEnabled(false): sets hapticsEnabled to false", async () => {
		mockSetItem.mockResolvedValueOnce(undefined);
		await usePrefsStore.getState().setHapticsEnabled(false);
		expect(usePrefsStore.getState().hapticsEnabled).toBe(false);
	});

	it("setHapticsEnabled(false): calls AsyncStorage.setItem with correct key and value", async () => {
		mockSetItem.mockResolvedValueOnce(undefined);
		await usePrefsStore.getState().setHapticsEnabled(false);
		expect(mockSetItem).toHaveBeenCalledWith(
			"fixit_prefs",
			JSON.stringify({ hapticsEnabled: false }),
		);
	});

	it("setHapticsEnabled(true): sets hapticsEnabled to true", async () => {
		mockSetItem.mockResolvedValue(undefined);
		await usePrefsStore.getState().setHapticsEnabled(false);
		await usePrefsStore.getState().setHapticsEnabled(true);
		expect(usePrefsStore.getState().hapticsEnabled).toBe(true);
	});

	it("toggleHaptics(): inverts hapticsEnabled from true to false", async () => {
		mockSetItem.mockResolvedValue(undefined);
		expect(usePrefsStore.getState().hapticsEnabled).toBe(true);
		usePrefsStore.getState().toggleHaptics();
		// Allow async persist to settle
		await vi.runAllTimersAsync().catch(() => {});
		expect(usePrefsStore.getState().hapticsEnabled).toBe(false);
	});

	it("toggleHaptics(): inverts hapticsEnabled from false to true", async () => {
		mockSetItem.mockResolvedValue(undefined);
		usePrefsStore.setState({ hapticsEnabled: false });
		usePrefsStore.getState().toggleHaptics();
		await vi.runAllTimersAsync().catch(() => {});
		expect(usePrefsStore.getState().hapticsEnabled).toBe(true);
	});

	it("toggleHaptics(): rapid consecutive calls correctly invert state", async () => {
		mockSetItem.mockResolvedValue(undefined);
		// true -> false -> true -> false
		usePrefsStore.getState().toggleHaptics();
		usePrefsStore.getState().toggleHaptics();
		usePrefsStore.getState().toggleHaptics();
		await vi.runAllTimersAsync().catch(() => {});
		expect(usePrefsStore.getState().hapticsEnabled).toBe(false);
	});

	it("loadPrefs(): with stored JSON {hapticsEnabled: false} sets state false and isLoaded true", async () => {
		mockGetItem.mockResolvedValueOnce(
			JSON.stringify({ hapticsEnabled: false }),
		);
		await usePrefsStore.getState().loadPrefs();
		expect(usePrefsStore.getState().hapticsEnabled).toBe(false);
		expect(usePrefsStore.getState().isLoaded).toBe(true);
	});

	it("loadPrefs(): with no stored value keeps default true and sets isLoaded true", async () => {
		mockGetItem.mockResolvedValueOnce(null);
		await usePrefsStore.getState().loadPrefs();
		expect(usePrefsStore.getState().hapticsEnabled).toBe(true);
		expect(usePrefsStore.getState().isLoaded).toBe(true);
	});

	it("loadPrefs(): with AsyncStorage throwing keeps default and sets isLoaded true", async () => {
		mockGetItem.mockRejectedValueOnce(new Error("Storage failure"));
		await usePrefsStore.getState().loadPrefs();
		expect(usePrefsStore.getState().hapticsEnabled).toBe(true);
		expect(usePrefsStore.getState().isLoaded).toBe(true);
	});
});
