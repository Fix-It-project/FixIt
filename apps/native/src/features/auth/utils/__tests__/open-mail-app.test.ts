import { beforeEach, describe, expect, it, vi } from "vitest";

const { Linking, Platform } = vi.hoisted(() => ({
	Linking: {
		canOpenURL: vi.fn(),
		openURL: vi.fn(),
	},
	Platform: { OS: "ios" as "ios" | "android" },
}));

vi.mock("react-native", () => ({ Linking, Platform }));

import { openMailApp } from "../open-mail-app";

describe("openMailApp", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		Platform.OS = "ios";
		Linking.openURL.mockResolvedValue(undefined);
	});

	it("opens the first installed mail client and stops", async () => {
		Linking.canOpenURL.mockResolvedValue(true);

		await openMailApp();

		expect(Linking.openURL).toHaveBeenCalledTimes(1);
		expect(Linking.openURL).toHaveBeenCalledWith("googlegmail://");
	});

	it("falls through to the next candidate when the first is unavailable", async () => {
		Linking.canOpenURL
			.mockResolvedValueOnce(false) // googlegmail://
			.mockResolvedValueOnce(true); // ms-outlook://

		await openMailApp();

		expect(Linking.openURL).toHaveBeenCalledWith("ms-outlook://");
	});

	it("falls back to a generic mailto: when no client is installed", async () => {
		Linking.canOpenURL.mockResolvedValue(false);

		await openMailApp();

		expect(Linking.openURL).toHaveBeenCalledTimes(1);
		expect(Linking.openURL).toHaveBeenCalledWith("mailto:");
	});

	it("skips a candidate that throws and continues probing", async () => {
		Linking.canOpenURL
			.mockRejectedValueOnce(new Error("denied")) // googlegmail:// throws
			.mockResolvedValueOnce(true); // ms-outlook:// (next iOS candidate)

		await openMailApp();

		expect(Linking.openURL).toHaveBeenCalledWith("ms-outlook://");
	});

	it("uses the Android candidate ordering", async () => {
		Platform.OS = "android";
		Linking.canOpenURL.mockResolvedValue(true);

		await openMailApp();

		// Android tries googlegmail:// first per ANDROID_MAIL_URLS.
		expect(Linking.openURL).toHaveBeenCalledWith("googlegmail://");
	});
});
