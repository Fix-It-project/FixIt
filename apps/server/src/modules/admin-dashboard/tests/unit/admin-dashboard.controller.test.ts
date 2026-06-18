import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	createMockReq,
	createMockRes,
} from "../../../../../tests/mocks/express.mock.js";

const { mockService } = vi.hoisted(() => ({
	mockService: {
		getSummary: vi.fn(),
		getOrdersSeries: vi.fn(),
		getOrderDetail: vi.fn(),
		blockHomeowner: vi.fn(),
		verifyTechnician: vi.fn(),
	},
}));

vi.mock("../../admin-dashboard.service.js", () => ({
	adminDashboardService: mockService,
}));

const { adminDashboardController } = await import(
	"../../admin-dashboard.controller.js"
);

// asyncHandler dispatches the inner promise but returns undefined synchronously,
// so flush the microtask queue before asserting on res / next.
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

describe("AdminDashboardController", () => {
	beforeEach(() => {
		for (const m of Object.values(mockService)) m.mockReset();
	});

	// ── getSummary ──────────────────────────────────────────────────────────────
	describe("getSummary", () => {
		it("returns 200 with the service payload wrapped in { data }", async () => {
			const summary = { kpis: [], statusShare: [] };
			mockService.getSummary.mockResolvedValue(summary);

			const req = mockReq();
			const res = createMockRes();
			const { next } = await runHandler(
				adminDashboardController.getSummary,
				req,
				res,
			);

			expect(res.statusCode).toBe(200);
			expect(res.body).toEqual({ data: summary });
			expect(next).not.toHaveBeenCalled();
		});
	});

	// ── getOrdersSeries ───────────────────────────────────────────────────────────
	describe("getOrdersSeries", () => {
		it("defaults the range to 30d when no query param is given", async () => {
			mockService.getOrdersSeries.mockResolvedValue({ days: [] });

			const req = mockReq({ query: {} });
			const res = createMockRes();
			await runHandler(adminDashboardController.getOrdersSeries, req, res);

			expect(mockService.getOrdersSeries).toHaveBeenCalledWith("30d");
		});

		it("passes the requested range through", async () => {
			mockService.getOrdersSeries.mockResolvedValue({ days: [] });

			const req = mockReq({ query: { range: "7d" } });
			const res = createMockRes();
			await runHandler(adminDashboardController.getOrdersSeries, req, res);

			expect(mockService.getOrdersSeries).toHaveBeenCalledWith("7d");
		});
	});

	// ── getOrderDetail (param handler) ──────────────────────────────────────────
	describe("getOrderDetail", () => {
		it("passes the route id to the service and returns 200", async () => {
			const detail = { id: "ord-1" };
			mockService.getOrderDetail.mockResolvedValue(detail);

			const req = mockReq({ params: { id: "ord-1" } });
			const res = createMockRes();
			await runHandler(adminDashboardController.getOrderDetail, req, res);

			expect(mockService.getOrderDetail).toHaveBeenCalledWith("ord-1");
			expect(res.statusCode).toBe(200);
			expect(res.body).toEqual({ data: detail });
		});
	});

	// ── blockHomeowner (param + body + audit log) ───────────────────────────────
	describe("blockHomeowner", () => {
		it("forwards id + reason and writes an audit log", async () => {
			mockService.blockHomeowner.mockResolvedValue({ id: "u1" });

			const req = mockReq({
				params: { id: "u1" },
				body: { reason: "Fraud" },
			});
			const res = createMockRes();
			await runHandler(adminDashboardController.blockHomeowner, req, res);

			expect(mockService.blockHomeowner).toHaveBeenCalledWith("u1", "Fraud");
			expect(req.log.info).toHaveBeenCalledWith(
				expect.objectContaining({
					action: "admin_block_homeowner",
					homeownerId: "u1",
				}),
			);
			expect(res.statusCode).toBe(200);
		});
	});

	// ── error forwarding ─────────────────────────────────────────────────────────
	describe("error handling", () => {
		it("forwards service errors via next() without writing a response", async () => {
			const err = new Error("boom");
			mockService.verifyTechnician.mockRejectedValue(err);

			const req = mockReq({ params: { id: "t1" } });
			const res = createMockRes();
			const { next } = await runHandler(
				adminDashboardController.verifyTechnician,
				req,
				res,
			);

			expect(next).toHaveBeenCalledTimes(1);
			expect(next.mock.calls[0]?.[0]).toBe(err);
			expect(res.status).not.toHaveBeenCalled();
			expect(res.json).not.toHaveBeenCalled();
		});
	});
});
