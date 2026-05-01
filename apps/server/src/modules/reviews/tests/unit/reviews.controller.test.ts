import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	createMockReq,
	createMockRes,
} from "../../../../../tests/mocks/express.mock.js";

const { mockService } = vi.hoisted(() => ({
	mockService: {
		createReviewForUser: vi.fn(),
		getReviewsForTechnician: vi.fn(),
		getReviewsForAuthenticatedTechnician: vi.fn(),
	},
}));

vi.mock("../../reviews.service.js", () => ({
	reviewsService: mockService,
}));

const { ReviewsController } = await import("../../reviews.controller.js");

describe("ReviewsController", () => {
	let controller: InstanceType<typeof ReviewsController>;

	beforeEach(() => {
		controller = new ReviewsController();
		mockService.createReviewForUser.mockReset();
		mockService.getReviewsForTechnician.mockReset();
		mockService.getReviewsForAuthenticatedTechnician.mockReset();
	});

	describe("createReview", () => {
		it("returns 201 with the created review on success", async () => {
			const review = { id: "rev-1", rating: 5, comment: null };
			mockService.createReviewForUser.mockResolvedValue(review);

			const req = createMockReq({
				body: { order_id: "ord-1", rating: 5 },
			});
			(req as any).user = { id: "user-1" };
			const res = createMockRes();

			await controller.createReview(req, res);

			expect(mockService.createReviewForUser).toHaveBeenCalledWith("user-1", {
				order_id: "ord-1",
				rating: 5,
			});
			expect(res.statusCode).toBe(201);
			expect(res.body).toEqual({ data: review });
		});

		it("maps thrown { status, message } via normalizeError", async () => {
			mockService.createReviewForUser.mockRejectedValue({
				status: 409,
				message: "Review already submitted for this order",
			});

			const req = createMockReq({ body: { order_id: "ord-1", rating: 5 } });
			(req as any).user = { id: "user-1" };
			const res = createMockRes();

			await controller.createReview(req, res);

			expect(res.statusCode).toBe(409);
			expect(res.body).toEqual({
				error: "Review already submitted for this order",
			});
		});

		it("maps generic Error to 500", async () => {
			mockService.createReviewForUser.mockRejectedValue(new Error("boom"));

			const req = createMockReq({ body: { order_id: "ord-1", rating: 5 } });
			(req as any).user = { id: "user-1" };
			const res = createMockRes();

			await controller.createReview(req, res);

			expect(res.statusCode).toBe(500);
			expect(res.body).toEqual({ error: "boom" });
		});
	});

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

			const req = createMockReq({
				params: { id: "tech-1" } as any,
				query: { limit: 10, offset: 0 } as any,
			});
			const res = createMockRes();

			await controller.getTechnicianReviews(req, res);

			expect(mockService.getReviewsForTechnician).toHaveBeenCalledWith(
				"tech-1",
				10,
				0,
			);
			expect(res.statusCode).toBe(200);
			expect(res.body).toEqual({ data: list });
		});

		it("maps thrown errors via normalizeError", async () => {
			mockService.getReviewsForTechnician.mockRejectedValue(
				new Error("db down"),
			);

			const req = createMockReq({
				params: { id: "tech-1" } as any,
				query: { limit: 10, offset: 0 } as any,
			});
			const res = createMockRes();

			await controller.getTechnicianReviews(req, res);

			expect(res.statusCode).toBe(500);
			expect(res.body).toEqual({ error: "db down" });
		});
	});

	describe("getMyTechnicianReviews", () => {
		it("returns 200 with the list and forwards authenticated technician id, limit, offset", async () => {
			const list = [
				{
					id: "r1",
					rating: 5,
					comment: "great",
					created_at: "now",
					reviewer_name: "A",
				},
			];
			mockService.getReviewsForAuthenticatedTechnician.mockResolvedValue(list);

			const req = createMockReq({
				query: { limit: 20, offset: 0 } as any,
			});
			(req as any).technician = { id: "tech-1" };
			const res = createMockRes();

			await controller.getMyTechnicianReviews(req, res);

			expect(
				mockService.getReviewsForAuthenticatedTechnician,
			).toHaveBeenCalledWith("tech-1", 20, 0);
			expect(res.statusCode).toBe(200);
			expect(res.body).toEqual({ data: list });
		});

		it("maps thrown errors via normalizeError", async () => {
			mockService.getReviewsForAuthenticatedTechnician.mockRejectedValue(
				new Error("db down"),
			);

			const req = createMockReq({
				query: { limit: 20, offset: 0 } as any,
			});
			(req as any).technician = { id: "tech-1" };
			const res = createMockRes();

			await controller.getMyTechnicianReviews(req, res);

			expect(res.statusCode).toBe(500);
			expect(res.body).toEqual({ error: "db down" });
		});
	});
});
