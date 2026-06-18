import { env } from "@FixIt/env/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

// bcrypt.compare is mocked so we control password match without a real hash.
// jsonwebtoken stays real — the env secret is present, so sign/verify round-trips.
const { mockBcrypt } = vi.hoisted(() => ({
	mockBcrypt: { compare: vi.fn() },
}));

vi.mock("bcryptjs", () => ({
	default: mockBcrypt,
	...mockBcrypt,
}));

const { AdminAuthService } = await import("../../admin-auth.service.js");

describe("AdminAuthService", () => {
	let service: InstanceType<typeof AdminAuthService>;

	beforeEach(() => {
		service = new AdminAuthService();
		mockBcrypt.compare.mockReset();
	});

	describe("login", () => {
		it("returns a token + admin user on correct email and password", async () => {
			mockBcrypt.compare.mockResolvedValue(true);

			const result = await service.login(env.ADMIN_EMAIL, "secret");

			expect(result.user).toEqual({
				id: "admin",
				email: env.ADMIN_EMAIL,
				role: "admin",
			});
			// token is a real JWT — verifiable by the service itself
			expect(service.verify(result.token)).toMatchObject({
				id: "admin",
				email: env.ADMIN_EMAIL,
				role: "admin",
			});
		});

		it("rejects with 401 invalid_credentials on wrong password", async () => {
			mockBcrypt.compare.mockResolvedValue(false);

			await expect(
				service.login(env.ADMIN_EMAIL, "wrong"),
			).rejects.toMatchObject({
				status: 401,
				opts: { token: "invalid_credentials" },
			});
		});

		it("rejects wrong email yet still runs bcrypt (timing uniformity)", async () => {
			mockBcrypt.compare.mockResolvedValue(true);

			await expect(
				service.login("intruder@evil.com", "secret"),
			).rejects.toMatchObject({ status: 401 });
			expect(mockBcrypt.compare).toHaveBeenCalledTimes(1);
		});
	});

	describe("sign / verify", () => {
		it("signs a token that verify decodes back to the admin user", () => {
			const token = service.sign({
				id: "admin",
				email: env.ADMIN_EMAIL,
				role: "admin",
			});

			expect(service.verify(token)).toEqual({
				id: "admin",
				email: env.ADMIN_EMAIL,
				role: "admin",
			});
		});

		it("throws on a malformed token", () => {
			expect(() => service.verify("not-a-real-token")).toThrow();
		});
	});
});
