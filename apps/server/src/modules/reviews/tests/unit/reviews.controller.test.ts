import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	createMockReq,
	createMockRes,
} from "../../../../../tests/mocks/express.mock.js";

const { mockService } = vi.hoisted(() => ({
	mockService: {
		createReviewForUser: vi.fn(),
		getReviewsForTechnician: vi.fn(),
	},
}));

vi.mock("../../reviews.service.js", () => ({
	reviewsService: mockService,
}));

const { reviewsController } = await import("../../reviews.controller.js");

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

describe("ReviewsController", () => {
	beforeEach(() => {
		mockService.createReviewForUser.mockReset();
		mockService.getReviewsForTechnician.mockReset();
	});

	// ── createReview ─────────────────────────────────────────────────────────
	describe("createReview", () => {
		it("returns 201 with the created review on success", async () => {
			const review = { id: "rev-1", rating: 5, comment: null };
			mockService.createReviewForUser.mockResolvedValue(review);

			const req = mockReq({
				body: { order_id: "ord-1", rating: 5, technician_id: "tech-1" },
				user: { id: "user-1" },
			});
			const res = createMockRes();
			const { next } = await runHandler(
				reviewsController.createReview,
				req,
				res,
			);

			expect(mockService.createReviewForUser).toHaveBeenCalledWith("user-1", {
				order_id: "ord-1",
				rating: 5,
				technician_id: "tech-1",
			});
			expect(res.statusCode).toBe(201);
			expect(res.body).toEqual({ data: review });
			expect(next).not.toHaveBeenCalled();
		});

		it("forwards service errors via next() without writing a response", async () => {
			const err = Object.assign(new Error("Review already submitted"), {
				status: 409,
			});
			mockService.createReviewForUser.mockRejectedValue(err);

			const req = mockReq({
				body: { order_id: "ord-1", rating: 5 },
				user: { id: "user-1" },
			});
			const res = createMockRes();
			const { next } = await runHandler(
				reviewsController.createReview,
				req,
				res,
			);

			expect(next).toHaveBeenCalledTimes(1);
			expect(next.mock.calls[0]?.[0]).toBe(err);
			expect(res.status).not.toHaveBeenCalled();
			expect(res.json).not.toHaveBeenCalled();
		});
	});

	// ── getTechnicianReviews ─────────────────────────────────────────────────
	describe("getTechnicianReviews", () => {
		it("returns 200 with the list and forwards id, limit, offset", async () => {
			const list = [
				{
					id: "r1",
					rating: 5,
					comment: "great",
					created_at: "now",
					reviewer_name: "A",
				},
			];
			mockService.getReviewsForTechnician.mockResolvedValue(list);

			const req = mockReq({
				params: { id: "tech-1" },
				query: { limit: 10, offset: 0 } as unknown as never,
			});
			const res = createMockRes();
			const { next } = await runHandler(
				reviewsController.getTechnicianReviews,
				req,
				res,
			);

			expect(mockService.getReviewsForTechnician).toHaveBeenCalledWith(
				"tech-1",
				10,
				0,
			);
			expect(res.statusCode).toBe(200);
			expect(res.body).toEqual({ data: list });
			expect(next).not.toHaveBeenCalled();
		});

		it("parses string pagination query params", async () => {
			mockService.getReviewsForTechnician.mockResolvedValue([]);

			const req = mockReq({
				params: { id: "tech-1" },
				query: { limit: "20", offset: "40" },
			});
			const res = createMockRes();
			const { next } = await runHandler(
				reviewsController.getTechnicianReviews,
				req,
				res,
			);

			expect(mockService.getReviewsForTechnician).toHaveBeenCalledWith(
				"tech-1",
				20,
				40,
			);
			expect(res.statusCode).toBe(200);
			expect(next).not.toHaveBeenCalled();
		});

		it("defaults invalid pagination and caps large limits", async () => {
			mockService.getReviewsForTechnician.mockResolvedValue([]);

			const req = mockReq({
				params: { id: "tech-1" },
				query: { limit: "500", offset: "-5" },
			});
			const res = createMockRes();
			const { next } = await runHandler(
				reviewsController.getTechnicianReviews,
				req,
				res,
			);

			expect(mockService.getReviewsForTechnician).toHaveBeenCalledWith(
				"tech-1",
				50,
				0,
			);
			expect(res.statusCode).toBe(200);
			expect(next).not.toHaveBeenCalled();
		});

		it("forwards service errors via next()", async () => {
			mockService.getReviewsForTechnician.mockRejectedValue(
				new Error("db down"),
			);

			const req = mockReq({
				params: { id: "tech-1" },
				query: { limit: 10, offset: 0 } as unknown as never,
			});
			const res = createMockRes();
			const { next } = await runHandler(
				reviewsController.getTechnicianReviews,
				req,
				res,
			);

			expect(next).toHaveBeenCalledTimes(1);
			expect(next.mock.calls[0]?.[0]).toBeInstanceOf(Error);
		});
	});
});
