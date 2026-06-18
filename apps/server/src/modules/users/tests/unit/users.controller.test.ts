import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	createMockReq,
	createMockRes,
} from "../../../../../tests/mocks/express.mock.js";

const { mockService } = vi.hoisted(() => ({
	mockService: {
		getProfile: vi.fn(),
		updateProfile: vi.fn(),
		getStats: vi.fn(),
	},
}));

vi.mock("../../users.service.js", () => ({
	usersService: mockService,
}));

const { usersController } = await import("../../users.controller.js");

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

describe("UsersController", () => {
	beforeEach(() => {
		for (const m of Object.values(mockService)) m.mockReset();
	});

	describe("getProfile", () => {
		it("returns 200 { profile } for the authed user", async () => {
			const profile = { id: "u1", addresses: [] };
			mockService.getProfile.mockResolvedValue(profile);

			const req = mockReq({ user: { id: "u1" } } as never);
			const res = createMockRes();
			await runHandler(usersController.getProfile, req, res);

			expect(mockService.getProfile).toHaveBeenCalledWith("u1");
			expect(res.statusCode).toBe(200);
			expect(res.body).toEqual({ profile });
		});

		it("forwards a 401 via next() when not authenticated", async () => {
			const req = mockReq(); // no req.user
			const res = createMockRes();
			const { next } = await runHandler(usersController.getProfile, req, res);

			expect(next).toHaveBeenCalledTimes(1);
			expect(next.mock.calls[0]?.[0]).toMatchObject({ status: 401 });
			expect(mockService.getProfile).not.toHaveBeenCalled();
		});
	});

	describe("updateProfile", () => {
		it("forwards the body fields and returns 200 { profile }", async () => {
			const updated = { id: "u1", full_name: "Jane" };
			mockService.updateProfile.mockResolvedValue(updated);

			const req = mockReq({
				user: { id: "u1" },
				body: { full_name: "Jane", email: "new@example.com", phone: "555" },
			} as never);
			const res = createMockRes();
			await runHandler(usersController.updateProfile, req, res);

			expect(mockService.updateProfile).toHaveBeenCalledWith("u1", {
				full_name: "Jane",
				email: "new@example.com",
				phone: "555",
			});
			expect(res.statusCode).toBe(200);
			expect(res.body).toEqual({ profile: updated });
		});
	});

	describe("getStats", () => {
		it("returns 200 { stats }", async () => {
			const stats = { totalBookings: 5 };
			mockService.getStats.mockResolvedValue(stats);

			const req = mockReq({ user: { id: "u1" } } as never);
			const res = createMockRes();
			await runHandler(usersController.getStats, req, res);

			expect(mockService.getStats).toHaveBeenCalledWith("u1");
			expect(res.statusCode).toBe(200);
			expect(res.body).toEqual({ stats });
		});
	});
});
