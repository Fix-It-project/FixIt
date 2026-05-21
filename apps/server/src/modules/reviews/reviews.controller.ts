import type { Request, Response } from "express";
import { normalizeError } from "../../shared/errors/index.js";
import { requireUserId } from "../../shared/utils/request-auth.js";
import { reviewsService } from "./reviews.service.js";

export class ReviewsController {
	async createReview(req: Request, res: Response) {
		try {
			const userId = requireUserId(req);
			const review = await reviewsService.createReviewForUser(userId, req.body);
			return res.status(201).json({ data: review });
		} catch (err: unknown) {
			const { status, message } = normalizeError(err);
			return res.status(status).json({ error: message });
		}
	}

	async getTechnicianReviews(req: Request, res: Response) {
		try {
			const { id } = req.params as { id: string };
			const { limit, offset } = req.query as unknown as {
				limit: number;
				offset: number;
			};
			const reviews = await reviewsService.getReviewsForTechnician(
				id,
				limit,
				offset,
			);
			return res.status(200).json({ data: reviews });
		} catch (err: unknown) {
			const { status, message } = normalizeError(err);
			return res.status(status).json({ error: message });
		}
	}
}

export const reviewsController = new ReviewsController();
