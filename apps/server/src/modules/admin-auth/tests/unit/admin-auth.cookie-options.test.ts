import { describe, expect, it, vi } from "vitest";

vi.mock("@FixIt/env/server", () => ({
	env: {
		NODE_ENV: "production",
		ADMIN_COOKIE_SAME_SITE: "none",
		ADMIN_SESSION_TTL_SECONDS: 43200,
	},
}));

const { adminCookieOptions } = await import("../../admin-auth.service.js");

describe("adminCookieOptions", () => {
	it("uses a secure cross-site cookie when same-site is set to none", () => {
		expect(adminCookieOptions()).toEqual(
			expect.objectContaining({
				httpOnly: true,
				secure: true,
				sameSite: "none",
				path: "/",
				maxAge: 43_200_000,
			}),
		);
	});
});
