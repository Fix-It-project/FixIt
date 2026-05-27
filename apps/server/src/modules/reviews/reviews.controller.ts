import type { Request, RequestHandler } from "express";
import { asyncHandler } from "../../shared/errors/async-handler.js";
import { requireUserId } from "../../shared/utils/request-auth.js";
import { reviewsService } from "./reviews.service.js";

export class ReviewsController {
	createReview: RequestHandler = asyncHandler(async (req: Request, res) => {
		const userId = requireUserId(req);
		const review = await reviewsService.createReviewForUser(userId, req.body);
		req.log.info({ action: 'review_created', userId, technicianId: req.body.technician_id });
		res.status(201).json({ data: review });
	});

	getTechnicianReviews: RequestHandler = asyncHandler(async (req: Request, res) => {
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
		res.status(200).json({ data: reviews });
	});
}

export const reviewsController = new ReviewsController();
