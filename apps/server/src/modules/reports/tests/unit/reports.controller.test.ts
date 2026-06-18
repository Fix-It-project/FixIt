import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	createMockReq,
	createMockRes,
} from "../../../../../tests/mocks/express.mock.js";

const { mockService } = vi.hoisted(() => ({
	mockService: {
		submit: vi.fn(),
		listReports: vi.fn(),
		resolve: vi.fn(),
		dismiss: vi.fn(),
		reopen: vi.fn(),
		warn: vi.fn(),
	},
}));

vi.mock("../../reports.service.js", () => ({
	reportsService: mockService,
}));

const { reportsController } = await import("../../reports.controller.js");

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

describe("ReportsController", () => {
	beforeEach(() => {
		for (const m of Object.values(mockService)) m.mockReset();
	});

	// ── submitAsUser ──────────────────────────────────────────────────────────
	describe("submitAsUser", () => {
		it("forwards the authed user id + body and returns 201 { report }", async () => {
			const report = { id: "rep-1", status: "open" };
			mockService.submit.mockResolvedValue(report);

			const req = mockReq({
				user: { id: "user-1" },
				body: { orderId: "ord-1", label: "no_show", summary: "Never came" },
			});
			const res = createMockRes();
			const { next } = await runHandler(
				reportsController.submitAsUser,
				req,
				res,
			);

			expect(mockService.submit).toHaveBeenCalledWith("user-1", "user", {
				orderId: "ord-1",
				label: "no_show",
				summary: "Never came",
			});
			expect(req.log.info).toHaveBeenCalledWith(
				expect.objectContaining({
					action: "report_submitted",
					reporterRole: "user",
					reporterId: "user-1",
				}),
			);
			expect(res.statusCode).toBe(201);
			expect(res.body).toEqual({ report });
			expect(next).not.toHaveBeenCalled();
		});

		it("forwards a 401 via next() when the user is not authenticated", async () => {
			const req = mockReq({ body: {} }); // no req.user
			const res = createMockRes();
			const { next } = await runHandler(
				reportsController.submitAsUser,
				req,
				res,
			);

			expect(next).toHaveBeenCalledTimes(1);
			expect(next.mock.calls[0]?.[0]).toMatchObject({ status: 401 });
			expect(mockService.submit).not.toHaveBeenCalled();
		});
	});

	// ── submitAsTechnician ──────────────────────────────────────────────────────
	describe("submitAsTechnician", () => {
		it("forwards the authed technician id with role 'technician' and returns 201", async () => {
			mockService.submit.mockResolvedValue({ id: "rep-2" });

			const req = mockReq({
				technician: { id: "tech-1" },
				body: { orderId: "ord-2", label: "overcharged", summary: "x" },
			});
			const res = createMockRes();
			await runHandler(reportsController.submitAsTechnician, req, res);

			expect(mockService.submit).toHaveBeenCalledWith("tech-1", "technician", {
				orderId: "ord-2",
				label: "overcharged",
				summary: "x",
			});
			expect(res.statusCode).toBe(201);
		});
	});

	// ── listForAdmin ────────────────────────────────────────────────────────────
	describe("listForAdmin", () => {
		it("passes the query through and returns 200 { data, total, counts }", async () => {
			const payload = {
				data: [{ id: "rep-1" }],
				total: 1,
				counts: { open: 1 },
			};
			mockService.listReports.mockResolvedValue(payload);

			const query = { status: "open", source: "all" };
			const req = mockReq({ query });
			const res = createMockRes();
			await runHandler(reportsController.listForAdmin, req, res);

			expect(mockService.listReports).toHaveBeenCalledWith(query);
			expect(res.statusCode).toBe(200);
			expect(res.body).toEqual(payload);
		});
	});

	// ── resolve (representative of resolve/dismiss/reopen/warn) ──────────────────
	describe("resolve", () => {
		it("passes the route id, logs the admin action, and returns 200 { data }", async () => {
			const data = { id: "rep-1", status: "closed" };
			mockService.resolve.mockResolvedValue(data);

			const req = mockReq({ params: { id: "rep-1" } });
			const res = createMockRes();
			await runHandler(reportsController.resolve, req, res);

			expect(mockService.resolve).toHaveBeenCalledWith("rep-1");
			expect(req.log.info).toHaveBeenCalledWith(
				expect.objectContaining({
					action: "admin_resolve_report",
					reportId: "rep-1",
				}),
			);
			expect(res.statusCode).toBe(200);
			expect(res.body).toEqual({ data });
		});
	});

	// ── error forwarding ──────────────────────────────────────────────────────────
	describe("error handling", () => {
		it("forwards service errors via next() without writing a response", async () => {
			const err = new Error("boom");
			mockService.warn.mockRejectedValue(err);

			const req = mockReq({ params: { id: "rep-1" } });
			const res = createMockRes();
			const { next } = await runHandler(reportsController.warn, req, res);

			expect(next).toHaveBeenCalledTimes(1);
			expect(next.mock.calls[0]?.[0]).toBe(err);
			expect(res.status).not.toHaveBeenCalled();
			expect(res.json).not.toHaveBeenCalled();
		});
	});
});
