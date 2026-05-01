import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockOrdersRepo, mockReviewsRepo } = vi.hoisted(() => ({
	mockOrdersRepo: {
		getOrderById: vi.fn(),
	},
	mockReviewsRepo: {
		createReview: vi.fn(),
		listReviewsForTechnician: vi.fn(),
	},
}));

vi.mock("../../../orders/orders.repository.js", () => ({
	ordersRepository: mockOrdersRepo,
}));

vi.mock("../../reviews.repository.js", () => ({
	reviewsRepository: mockReviewsRepo,
}));

const { ReviewsService } = await import("../../reviews.service.js");

describe("ReviewsService", () => {
	let service: InstanceType<typeof ReviewsService>;

	const userId = "user-1";
	const technicianId = "tech-1";
	const orderId = "order-1";

	const completedOrder = {
		id: orderId,
		user_id: userId,
		technician_id: technicianId,
		status: "completed",
	};

	beforeEach(() => {
		service = new ReviewsService();
		mockOrdersRepo.getOrderById.mockReset();
		mockReviewsRepo.createReview.mockReset();
		mockReviewsRepo.listReviewsForTechnician.mockReset();
	});

	describe("createReviewForUser", () => {
		it("throws 404 when order does not exist", async () => {
			mockOrdersRepo.getOrderById.mockResolvedValue(null);

			await expect(
				service.createReviewForUser(userId, { order_id: orderId, rating: 5 }),
			).rejects.toMatchObject({ status: 404 });
			expect(mockReviewsRepo.createReview).not.toHaveBeenCalled();
		});

		it("throws 404 when order belongs to another user", async () => {
			mockOrdersRepo.getOrderById.mockResolvedValue({
				...completedOrder,
				user_id: "someone-else",
			});

			await expect(
				service.createReviewForUser(userId, { order_id: orderId, rating: 5 }),
			).rejects.toMatchObject({ status: 404 });
			expect(mockReviewsRepo.createReview).not.toHaveBeenCalled();
		});

		it("throws 400 when order is not completed", async () => {
			mockOrdersRepo.getOrderById.mockResolvedValue({
				...completedOrder,
				status: "accepted",
			});

			await expect(
				service.createReviewForUser(userId, { order_id: orderId, rating: 5 }),
			).rejects.toMatchObject({ status: 400 });
			expect(mockReviewsRepo.createReview).not.toHaveBeenCalled();
		});

		it("inserts with server-derived technician_id and ignores any client-supplied one", async () => {
			mockOrdersRepo.getOrderById.mockResolvedValue(completedOrder);
			mockReviewsRepo.createReview.mockResolvedValue({ id: "rev-1" });

			await service.createReviewForUser(userId, {
				order_id: orderId,
				rating: 4,
				comment: "good",
			});

			expect(mockReviewsRepo.createReview).toHaveBeenCalledWith({
				user_id: userId,
				order_id: orderId,
				technician_id: technicianId,
				rating: 4,
				comment: "good",
			});
		});

		it("passes nulls when rating or comment is omitted", async () => {
			mockOrdersRepo.getOrderById.mockResolvedValue(completedOrder);
			mockReviewsRepo.createReview.mockResolvedValue({ id: "rev-1" });

			await service.createReviewForUser(userId, {
				order_id: orderId,
				rating: 5,
			});

			expect(mockReviewsRepo.createReview).toHaveBeenCalledWith({
				user_id: userId,
				order_id: orderId,
				technician_id: technicianId,
				rating: 5,
				comment: null,
			});
		});

		it("rethrows 23505 unique violation as 409", async () => {
			mockOrdersRepo.getOrderById.mockResolvedValue(completedOrder);
			mockReviewsRepo.createReview.mockRejectedValue({ code: "23505" });

			await expect(
				service.createReviewForUser(userId, { order_id: orderId, rating: 5 }),
			).rejects.toMatchObject({ status: 409 });
		});

		it("propagates unexpected repository errors unchanged", async () => {
			mockOrdersRepo.getOrderById.mockResolvedValue(completedOrder);
			const dbErr = new Error("connection lost");
			mockReviewsRepo.createReview.mockRejectedValue(dbErr);

			await expect(
				service.createReviewForUser(userId, { order_id: orderId, rating: 5 }),
			).rejects.toBe(dbErr);
		});
	});

	describe("getReviewsForTechnician", () => {
		it("delegates to repository with passed args", async () => {
			mockReviewsRepo.listReviewsForTechnician.mockResolvedValue([
				{ id: "r1" },
			]);

			const out = await service.getReviewsForTechnician(technicianId, 10, 5);

			expect(mockReviewsRepo.listReviewsForTechnician).toHaveBeenCalledWith(
				technicianId,
				10,
				5,
			);
			expect(out).toEqual([{ id: "r1" }]);
		});
	});

	describe("getReviewsForAuthenticatedTechnician", () => {
		it("delegates to the technician review listing for the authenticated technician", async () => {
			mockReviewsRepo.listReviewsForTechnician.mockResolvedValue([
				{ id: "r1" },
			]);

			const out = await service.getReviewsForAuthenticatedTechnician(
				technicianId,
				20,
				0,
			);

			expect(mockReviewsRepo.listReviewsForTechnician).toHaveBeenCalledWith(
				technicianId,
				20,
				0,
			);
			expect(out).toEqual([{ id: "r1" }]);
		});
	});
});
