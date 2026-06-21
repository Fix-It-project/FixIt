import { beforeEach, describe, expect, it } from "vitest";
import { useUserSignupStore } from "../user-signup-store";

const STEP1 = {
	fullName: "Jane Homeowner",
	email: "jane@example.com",
	phone: "+201001234567",
	password: "secret123",
};

describe("useUserSignupStore", () => {
	beforeEach(() => {
		useUserSignupStore.getState().reset();
	});

	it("defaults to password mode with empty fields", () => {
		const state = useUserSignupStore.getState();
		expect(state.mode).toBe("password");
		expect(state.email).toBe("");
		expect(state.pendingSession).toBeNull();
	});

	it("setStep1Data captures credentials and forces password mode", () => {
		useUserSignupStore.getState().setStep1Data(STEP1);

		const state = useUserSignupStore.getState();
		expect(state.mode).toBe("password");
		expect(state.fullName).toBe("Jane Homeowner");
		expect(state.email).toBe("jane@example.com");
		expect(state.password).toBe("secret123");
		expect(state.pendingSession).toBeNull();
	});

	it("setPendingOAuth flips to oauth mode and holds tokens off the auth store", () => {
		useUserSignupStore.getState().setPendingOAuth({
			user: { id: "u-1", email: "oauth@example.com" },
			accessToken: "access-1",
			refreshToken: "refresh-1",
			fullName: "OAuth Jane",
		});

		const state = useUserSignupStore.getState();
		expect(state.mode).toBe("oauth");
		expect(state.email).toBe("oauth@example.com");
		expect(state.fullName).toBe("OAuth Jane");
		expect(state.pendingSession).toEqual({
			user: { id: "u-1", email: "oauth@example.com" },
			accessToken: "access-1",
			refreshToken: "refresh-1",
		});
	});

	it("setPendingOAuth defaults fullName to empty when the provider omits it", () => {
		useUserSignupStore.getState().setPendingOAuth({
			user: { id: "u-2", email: "noname@example.com" },
			accessToken: "a",
			refreshToken: "r",
		});

		expect(useUserSignupStore.getState().fullName).toBe("");
	});

	it("reset returns to the initial state", () => {
		useUserSignupStore.getState().setStep1Data(STEP1);
		useUserSignupStore.getState().reset();

		const state = useUserSignupStore.getState();
		expect(state.email).toBe("");
		expect(state.mode).toBe("password");
		expect(state.pendingSession).toBeNull();
	});
});
