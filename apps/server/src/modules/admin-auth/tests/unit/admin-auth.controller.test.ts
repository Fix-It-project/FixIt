import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	createMockReq,
	createMockRes,
	type MockResponse,
} from "../../../../../tests/mocks/express.mock.js";

const { mockService } = vi.hoisted(() => ({
	mockService: { login: vi.fn(), verify: vi.fn() },
}));

// Controller also imports adminCookieName + adminCookieOptions from the service
// module, so the mock must re-export those alongside the service singleton.
vi.mock("../../admin-auth.service.js", () => ({
	adminAuthService: mockService,
	adminCookieName: "admin_session",
	adminCookieOptions: () => ({
		httpOnly: true,
		sameSite: "lax",
		path: "/",
		maxAge: 1000,
	}),
}));

const { adminAuthController } = await import("../../admin-auth.controller.js");

async function runHandler(
	handler: (req: any, res: any, next: any) => void,
	req: any,
	res: any,
): Promise<{ next: ReturnType<typeof vi.fn> }> {
	const next = vi.fn();
	handler(req, res, next);
	await new Promise((resolve) => setImmediate(resolve));
	return { next };
}

function mockReq(overrides: Record<string, unknown> = {}) {
	const req = createMockReq(overrides as never) as any;
	req.log = { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() };
	return req;
}

// createMockRes lacks cookie helpers — augment with chainable spies.
function mockRes(): MockResponse & {
	cookie: ReturnType<typeof vi.fn>;
	clearCookie: ReturnType<typeof vi.fn>;
} {
	const res = createMockRes() as any;
	res.cookie = vi.fn(() => res);
	res.clearCookie = vi.fn(() => res);
	return res;
}

describe("AdminAuthController", () => {
	beforeEach(() => {
		for (const m of Object.values(mockService)) m.mockReset();
	});

	describe("login", () => {
		it("sets the session cookie, logs, and returns 200 { user }", async () => {
			const user = { id: "admin", email: "admin@test.local", role: "admin" };
			mockService.login.mockResolvedValue({ token: "tok-123", user });

			const req = mockReq({
				body: { email: "admin@test.local", password: "secret" },
			});
			const res = mockRes();
			const { next } = await runHandler(adminAuthController.login, req, res);

			expect(mockService.login).toHaveBeenCalledWith(
				"admin@test.local",
				"secret",
			);
			expect(res.cookie).toHaveBeenCalledWith(
				"admin_session",
				"tok-123",
				expect.objectContaining({ httpOnly: true }),
			);
			expect(req.log.info).toHaveBeenCalledWith(
				expect.objectContaining({
					action: "admin_login",
					email: "admin@test.local",
				}),
			);
			expect(res.statusCode).toBe(200);
			expect(res.body).toEqual({ user });
			expect(next).not.toHaveBeenCalled();
		});

		it("forwards service errors via next() without setting a cookie", async () => {
			const err = new Error("bad creds");
			mockService.login.mockRejectedValue(err);

			const req = mockReq({ body: { email: "x", password: "y" } });
			const res = mockRes();
			const { next } = await runHandler(adminAuthController.login, req, res);

			expect(next).toHaveBeenCalledTimes(1);
			expect(next.mock.calls[0]?.[0]).toBe(err);
			expect(res.cookie).not.toHaveBeenCalled();
			expect(res.json).not.toHaveBeenCalled();
		});
	});

	describe("logout", () => {
		it("clears the session cookie, logs, and returns 200 with a message", async () => {
			const req = mockReq();
			const res = mockRes();
			await runHandler(adminAuthController.logout, req, res);

			expect(res.clearCookie).toHaveBeenCalledWith(
				"admin_session",
				expect.any(Object),
			);
			expect(req.log.info).toHaveBeenCalledWith(
				expect.objectContaining({ action: "admin_logout" }),
			);
			expect(res.statusCode).toBe(200);
			expect(res.body).toEqual({ message: "Signed out" });
		});
	});

	describe("getCurrentAdmin", () => {
		it("returns the admin attached by middleware as 200 { user }", async () => {
			const admin = { id: "admin", email: "admin@test.local", role: "admin" };
			const req = mockReq({ admin } as never);
			const res = mockRes();
			await runHandler(adminAuthController.getCurrentAdmin, req, res);

			expect(res.statusCode).toBe(200);
			expect(res.body).toEqual({ user: admin });
		});
	});
});
