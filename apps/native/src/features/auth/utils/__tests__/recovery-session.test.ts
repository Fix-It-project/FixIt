import { beforeEach, describe, expect, it } from "vitest";
import {
	clearRecoverySession,
	getRecoverySession,
	type RecoverySession,
	setRecoverySession,
} from "../recovery-session";

const SESSION: RecoverySession = {
	accessToken: "access-1",
	refreshToken: "refresh-1",
	userType: "user",
};

describe("recovery-session singleton", () => {
	beforeEach(() => {
		clearRecoverySession();
	});

	it("starts empty", () => {
		expect(getRecoverySession()).toBeNull();
	});

	it("stores and returns the set session", () => {
		setRecoverySession(SESSION);
		expect(getRecoverySession()).toEqual(SESSION);
	});

	it("clears the stored session", () => {
		setRecoverySession(SESSION);
		clearRecoverySession();
		expect(getRecoverySession()).toBeNull();
	});

	it("overwrites a previously stored session", () => {
		setRecoverySession(SESSION);
		setRecoverySession({ ...SESSION, accessToken: "access-2" });
		expect(getRecoverySession()?.accessToken).toBe("access-2");
	});
});
