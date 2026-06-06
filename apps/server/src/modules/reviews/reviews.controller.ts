import type { Request, RequestHandler } from "express";
import { asyncHandler } from "../../shared/errors/async-handler.js";
import { requireUserId } from "../../shared/utils/request-auth.js";
import { reviewsService } from "./reviews.service.js";

const REVIEW_PAGE_SIZE = 20;
const MAX_REVIEW_LIMIT = 50;

function parseReviewPagination(query: Request["query"]) {
	const requestedLimit = Number(query.limit);
	const requestedOffset = Number(query.offset);
	const limit =
		Number.isInteger(requestedLimit) && requestedLimit > 0
			? Math.min(requestedLimit, MAX_REVIEW_LIMIT)
			: REVIEW_PAGE_SIZE;
	const offset =
		Number.isInteger(requestedOffset) && requestedOffset >= 0
			? requestedOffset
			: 0;

	return { limit, offset };
}

export class ReviewsController {
	createReview: RequestHandler = asyncHandler(async (req: Request, res) => {
		const userId = requireUserId(req);
		const review = await reviewsService.createReviewForUser(userId, req.body);
		req.log.info({
			action: "review_created",
			userId,
			technicianId: req.body.technician_id,
		});
		res.status(201).json({ data: review });
	});

	getTechnicianReviews: RequestHandler = asyncHandler(
		async (req: Request, res) => {
			const { id } = req.params as { id: string };
			const { limit, offset } = parseReviewPagination(req.query);
			const reviews = await reviewsService.getReviewsForTechnician(
				id,
				limit,
				offset,
			);
			res.status(200).json({ data: reviews });
		},
	);

	getTechnicianReviewSummary: RequestHandler = asyncHandler(
		async (req: Request, res) => {
			const { id } = req.params as { id: string };
			const summary = await reviewsService.getReviewSummaryForTechnician(id);
			res.status(200).json({ data: summary });
		},
	);
}

export const reviewsController = new ReviewsController();
