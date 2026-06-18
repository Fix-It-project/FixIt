import type { Router as RouterType } from "express";
import { Router } from "express";
import {
	CreateReviewBodySchema,
	TechnicianIdParamsSchema,
	TechnicianReviewsQuerySchema,
} from "../../shared/dtos/index.js";
import { requireTechnicianAuth } from "../../shared/middlewares/technician-auth.middleware.js";
import { requireUserAuth } from "../../shared/middlewares/user-auth.middleware.js";
import { validate } from "../../shared/middlewares/validate.middleware.js";
import { reviewsController } from "./reviews.controller.js";

const router: RouterType = Router();

router.post(
	"/",
	requireUserAuth,
	validate({ body: CreateReviewBodySchema }),
	reviewsController.createReview,
);

// Must precede "/technicians/:id/summary" so ":id" never captures "me".
router.get(
	"/technicians/me/summary",
	requireTechnicianAuth,
	reviewsController.getMyReviewSummary,
);

router.get(
	"/technicians/:id/summary",
	requireUserAuth,
	validate({ params: TechnicianIdParamsSchema }),
	reviewsController.getTechnicianReviewSummary,
);

router.get(
	"/technicians/:id",
	requireUserAuth,
	validate({
		params: TechnicianIdParamsSchema,
		query: TechnicianReviewsQuerySchema,
	}),
	reviewsController.getTechnicianReviews,
);

export default router;
