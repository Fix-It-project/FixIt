import { beforeEach, describe, expect, it, vi } from "vitest";
import apiClient from "@/src/config/api-client";

vi.mock("@/src/config/api-client", () => ({
	default: { post: vi.fn(), get: vi.fn() },
}));

// safeParseResponse logs on failure; keep the test output clean.
vi.mock("@/src/lib/logger", () => ({
	logger: { error: vi.fn(), warn: vi.fn() },
}));

import {
	forgotPassword,
	oauthStatus,
	refreshSession,
	resetPassword,
	signIn,
	signOut,
	signUp,
} from "../auth";

const post = vi.mocked(apiClient.post);
const get = vi.mocked(apiClient.get);

const SESSION = {
	accessToken: "access-1",
	refreshToken: "refresh-1",
	expiresAt: 4_102_444_800,
};
const USER = { id: "u-1", email: "jane@example.com" };

beforeEach(() => {
	vi.clearAllMocks();
});

describe("signIn", () => {
	it("posts credentials to /api/auth/signin and returns the parsed session", async () => {
		post.mockResolvedValue({ data: { user: USER, session: SESSION } });

		const result = await signIn({
			email: "jane@example.com",
			password: "secret123",
		});

		expect(post).toHaveBeenCalledWith("/api/auth/signin", {
			email: "jane@example.com",
			password: "secret123",
		});
		expect(result).toEqual({ user: USER, session: SESSION });
	});

	it("throws a contextual error when the response shape is invalid", async () => {
		post.mockResolvedValue({ data: { user: USER } }); // missing session

		await expect(
			signIn({ email: "jane@example.com", password: "secret123" }),
		).rejects.toThrow("Invalid API response in signIn");
	});
});

describe("signUp", () => {
	it("posts to /api/auth/signup and returns user + message", async () => {
		post.mockResolvedValue({
			data: { user: USER, message: "Check your inbox" },
		});

		const result = await signUp({
			fullName: "Jane",
			email: "jane@example.com",
			phone: "+201001234567",
			password: "secret123",
		} as never);

		expect(post).toHaveBeenCalledWith("/api/auth/signup", expect.any(Object));
		expect(result.message).toBe("Check your inbox");
	});
});

describe("password recovery endpoints", () => {
	it("forgotPassword posts to /api/auth/forgot-password", async () => {
		post.mockResolvedValue({ data: { message: "sent" } });

		const result = await forgotPassword({ email: "jane@example.com" } as never);

		expect(post).toHaveBeenCalledWith("/api/auth/forgot-password", {
			email: "jane@example.com",
		});
		expect(result.message).toBe("sent");
	});

	it("resetPassword posts to /api/auth/reset-password", async () => {
		post.mockResolvedValue({ data: { message: "updated", user: null } });

		const result = await resetPassword({ newPassword: "brandnew1" } as never);

		expect(post).toHaveBeenCalledWith(
			"/api/auth/reset-password",
			expect.any(Object),
		);
		expect(result.message).toBe("updated");
	});
});

describe("session endpoints", () => {
	it("signOut posts to /api/auth/signout", async () => {
		post.mockResolvedValue({ data: { success: true, message: "bye" } });

		await expect(signOut()).resolves.toEqual({ success: true, message: "bye" });
		expect(post).toHaveBeenCalledWith("/api/auth/signout");
	});

	it("refreshSession sends the refresh token in the body", async () => {
		post.mockResolvedValue({ data: { user: USER, session: SESSION } });

		await refreshSession("refresh-1");

		expect(post).toHaveBeenCalledWith("/api/auth/refresh", {
			refreshToken: "refresh-1",
		});
	});

	it("oauthStatus reads needsProfile from /api/auth/oauth/status", async () => {
		get.mockResolvedValue({ data: { needsProfile: true } });

		const result = await oauthStatus();

		expect(get).toHaveBeenCalledWith("/api/auth/oauth/status");
		expect(result.needsProfile).toBe(true);
	});
});
