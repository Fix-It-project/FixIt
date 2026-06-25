import { describe, expect, it } from "vitest";
import {
	authUserSchema,
	forgotPasswordResponseSchema,
	getCurrentUserResponseSchema,
	oauthCompleteResponseSchema,
	oauthStatusResponseSchema,
	resetPasswordResponseSchema,
	signInResponseSchema,
	signOutResponseSchema,
	signUpResponseSchema,
	techCheckEmailResponseSchema,
	techSignInResponseSchema,
	techSignUpResponseSchema,
} from "../response.schema";

const SESSION = {
	accessToken: "access-123",
	refreshToken: "refresh-123",
	expiresAt: 4_102_444_800,
};

describe("authUserSchema", () => {
	it("parses id + email", () => {
		expect(
			authUserSchema.safeParse({ id: "u-1", email: "a@b.com" }).success,
		).toBe(true);
	});

	it("rejects a missing id", () => {
		expect(authUserSchema.safeParse({ email: "a@b.com" }).success).toBe(false);
	});
});

describe("signInResponseSchema", () => {
	it("requires both user and a well-formed session", () => {
		const result = signInResponseSchema.safeParse({
			user: { id: "u-1", email: "a@b.com" },
			session: SESSION,
		});
		expect(result.success).toBe(true);
	});

	it("rejects a session missing expiresAt", () => {
		const result = signInResponseSchema.safeParse({
			user: { id: "u-1", email: "a@b.com" },
			session: { accessToken: "a", refreshToken: "r" },
		});
		expect(result.success).toBe(false);
	});
});

describe("signUpResponseSchema", () => {
	it("parses user + message", () => {
		expect(
			signUpResponseSchema.safeParse({
				user: { id: "u-1", email: "a@b.com" },
				message: "Check your inbox",
			}).success,
		).toBe(true);
	});
});

describe("signOutResponseSchema", () => {
	it("parses success + message", () => {
		expect(
			signOutResponseSchema.safeParse({ success: true, message: "bye" }).success,
		).toBe(true);
	});
});

describe("oauth response schemas", () => {
	it("oauthStatusResponseSchema parses needsProfile boolean", () => {
		expect(
			oauthStatusResponseSchema.safeParse({ needsProfile: true }).success,
		).toBe(true);
		expect(
			oauthStatusResponseSchema.safeParse({ needsProfile: "yes" }).success,
		).toBe(false);
	});

	it("oauthCompleteResponseSchema parses user + message", () => {
		expect(
			oauthCompleteResponseSchema.safeParse({
				user: { id: "u-1", email: "a@b.com" },
				message: "done",
			}).success,
		).toBe(true);
	});
});

describe("getCurrentUserResponseSchema", () => {
	it("parses nested user_metadata with optional fields", () => {
		const result = getCurrentUserResponseSchema.safeParse({
			user: { id: "u-1", email: "a@b.com", user_metadata: {} },
		});
		expect(result.success).toBe(true);
	});

	it("rejects a user without user_metadata", () => {
		expect(
			getCurrentUserResponseSchema.safeParse({
				user: { id: "u-1", email: "a@b.com" },
			}).success,
		).toBe(false);
	});
});

describe("password recovery responses", () => {
	it("forgotPasswordResponseSchema parses message", () => {
		expect(
			forgotPasswordResponseSchema.safeParse({ message: "sent" }).success,
		).toBe(true);
	});

	it("resetPasswordResponseSchema allows an unknown user payload", () => {
		expect(
			resetPasswordResponseSchema.safeParse({ message: "ok", user: null })
				.success,
		).toBe(true);
	});
});

describe("technician response schemas", () => {
	it("techCheckEmailResponseSchema parses exists flag", () => {
		expect(techCheckEmailResponseSchema.safeParse({ exists: false }).success).toBe(
			true,
		);
	});

	it("techSignUpResponseSchema requires technician name fields", () => {
		expect(
			techSignUpResponseSchema.safeParse({
				technician: {
					id: "t-1",
					email: "t@b.com",
					first_name: "Sam",
					last_name: "Tech",
				},
				message: "pending review",
			}).success,
		).toBe(true);
	});

	it("techSignInResponseSchema requires technician + session", () => {
		expect(
			techSignInResponseSchema.safeParse({
				technician: { id: "t-1", email: "t@b.com" },
				session: SESSION,
			}).success,
		).toBe(true);
	});
});
