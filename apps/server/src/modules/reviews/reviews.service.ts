import { ordersRepository } from "../orders/orders.repository.js";
import {
	type Review,
	reviewsRepository,
	type TechnicianReviewSummary,
	type TechnicianReviewWithReviewer,
} from "./reviews.repository.js";

export interface CreateReviewRequest {
	order_id: string;
	rating?: number;
	comment?: string;
}

export class ReviewsService {
	async createReviewForUser(
		userId: string,
		body: CreateReviewRequest,
	): Promise<Review> {
		const order = await ordersRepository.getOrderById(body.order_id);
		if (!order || order.user_id !== userId) {
			throw { status: 404, message: "Order not found" };
		}
		if (order.status !== "completed") {
			throw {
				status: 400,
				message: "Reviews can only be submitted for completed orders",
			};
		}

		try {
			return await reviewsRepository.createReview({
				user_id: userId,
				order_id: order.id,
				technician_id: order.technician_id,
				rating: body.rating ?? null,
				comment: body.comment ?? null,
			});
		} catch (e: unknown) {
			const code =
				typeof e === "object" && e !== null && "code" in e ? e.code : undefined;
			if (code === "23505") {
				throw {
					status: 409,
					message: "Review already submitted for this order",
				};
			}
			throw e;
		}
	}

	async getReviewsForTechnician(
		technicianId: string,
		limit: number,
		offset: number,
	): Promise<TechnicianReviewWithReviewer[]> {
		return reviewsRepository.listReviewsForTechnician(
			technicianId,
			limit,
			offset,
		);
	}

	async getReviewSummaryForTechnician(
		technicianId: string,
	): Promise<TechnicianReviewSummary> {
		return reviewsRepository.getReviewSummary(technicianId);
	}
}

export const reviewsService = new ReviewsService();
