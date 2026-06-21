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
		if (order?.user_id !== userId) {
			throw Object.assign(new Error("Order not found"), { status: 404 });
		}
		if (order.status !== "completed") {
			throw Object.assign(
				new Error("Reviews can only be submitted for completed orders"),
				{ status: 400 },
			);
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
				throw Object.assign(
					new Error("Review already submitted for this order"),
					{ status: 409 },
				);
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
