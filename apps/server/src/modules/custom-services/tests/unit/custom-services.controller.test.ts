import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	createMockReq,
	createMockRes,
} from "../../../../../tests/mocks/express.mock.js";

const { mockService } = vi.hoisted(() => ({
	mockService: {
		submitRequest: vi.fn(),
		listOwn: vi.fn(),
		listRequests: vi.fn(),
		approve: vi.fn(),
		reject: vi.fn(),
	},
}));

vi.mock("../../custom-services.service.js", () => ({
	customServicesService: mockService,
}));

const { customServicesController } = await import(
	"../../custom-services.controller.js"
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

describe("CustomServicesController", () => {
	beforeEach(() => {
		for (const m of Object.values(mockService)) m.mockReset();
	});

	// ── submitOwn ─────────────────────────────────────────────────────────────
	describe("submitOwn", () => {
		it("forwards the technician id + body and returns 201 { request }", async () => {
			const request = { id: "req-1", status: "pending" };
			mockService.submitRequest.mockResolvedValue(request);

			const req = mockReq({
				technician: { id: "tech-1" },
				body: {
					name: "Drain camera",
					description: "desc",
					min_price: 100,
					max_price: 300,
				},
			});
			const res = createMockRes();
			const { next } = await runHandler(
				customServicesController.submitOwn,
				req,
				res,
			);

			expect(mockService.submitRequest).toHaveBeenCalledWith("tech-1", {
				name: "Drain camera",
				description: "desc",
				min_price: 100,
				max_price: 300,
			});
			expect(req.log.info).toHaveBeenCalledWith(
				expect.objectContaining({
					action: "custom_service_submitted",
					technicianId: "tech-1",
				}),
			);
			expect(res.statusCode).toBe(201);
			expect(res.body).toEqual({ request });
			expect(next).not.toHaveBeenCalled();
		});

		it("forwards a 401 via next() when the technician is not authenticated", async () => {
			const req = mockReq({ body: {} }); // no req.technician
			const res = createMockRes();
			const { next } = await runHandler(
				customServicesController.submitOwn,
				req,
				res,
			);

			expect(next).toHaveBeenCalledTimes(1);
			expect(next.mock.calls[0]?.[0]).toMatchObject({ status: 401 });
			expect(mockService.submitRequest).not.toHaveBeenCalled();
		});
	});

	// ── listOwn ───────────────────────────────────────────────────────────────
	describe("listOwn", () => {
		it("returns the technician's own requests as { requests } with status 200", async () => {
			const requests = [{ id: "req-1" }, { id: "req-2" }];
			mockService.listOwn.mockResolvedValue(requests);

			const req = mockReq({ technician: { id: "tech-1" } });
			const res = createMockRes();
			await runHandler(customServicesController.listOwn, req, res);

			expect(mockService.listOwn).toHaveBeenCalledWith("tech-1");
			expect(res.statusCode).toBe(200);
			expect(res.body).toEqual({ requests });
		});
	});

	// ── listForAdmin ────────────────────────────────────────────────────────────
	describe("listForAdmin", () => {
		it("passes the query through and returns 200 { data, total, counts }", async () => {
			const payload = {
				data: [{ id: "req-1" }],
				total: 1,
				counts: { pending: 1, decided: 0 },
			};
			mockService.listRequests.mockResolvedValue(payload);

			const query = { status: "pending" };
			const req = mockReq({ query });
			const res = createMockRes();
			await runHandler(customServicesController.listForAdmin, req, res);

			expect(mockService.listRequests).toHaveBeenCalledWith(query);
			expect(res.statusCode).toBe(200);
			expect(res.body).toEqual(payload);
		});
	});

	// ── approve ───────────────────────────────────────────────────────────────
	describe("approve", () => {
		it("passes the route id, logs the action, and returns 200 { data }", async () => {
			const data = { id: "req-1", status: "approved" };
			mockService.approve.mockResolvedValue(data);

			const req = mockReq({ params: { id: "req-1" } });
			const res = createMockRes();
			await runHandler(customServicesController.approve, req, res);

			expect(mockService.approve).toHaveBeenCalledWith("req-1");
			expect(req.log.info).toHaveBeenCalledWith(
				expect.objectContaining({
					action: "admin_approve_custom_service",
					requestId: "req-1",
				}),
			);
			expect(res.statusCode).toBe(200);
			expect(res.body).toEqual({ data });
		});
	});

	// ── reject ────────────────────────────────────────────────────────────────
	describe("reject", () => {
		it("forwards id + reason, logs the action, and returns 200 { data }", async () => {
			const data = { id: "req-1", status: "rejected" };
			mockService.reject.mockResolvedValue(data);

			const req = mockReq({
				params: { id: "req-1" },
				body: { reason: "Out of catalog range" },
			});
			const res = createMockRes();
			const { next } = await runHandler(
				customServicesController.reject,
				req,
				res,
			);

			expect(mockService.reject).toHaveBeenCalledWith(
				"req-1",
				"Out of catalog range",
			);
			expect(req.log.info).toHaveBeenCalledWith(
				expect.objectContaining({
					action: "admin_reject_custom_service",
					requestId: "req-1",
				}),
			);
			expect(res.statusCode).toBe(200);
			expect(res.body).toEqual({ data });
			expect(next).not.toHaveBeenCalled();
		});
	});
});
