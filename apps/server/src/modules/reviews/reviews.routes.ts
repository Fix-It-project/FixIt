import type { Router as RouterType } from "express";
import { Router } from "express";
import {
	CreateReviewBodySchema,
	TechnicianIdParamsSchema,
	TechnicianReviewsQuerySchema,
} from "../../shared/dtos/index.js";
import { requireUserAuth } from "../../shared/middlewares/user-auth.middleware.js";
import { validate } from "../../shared/middlewares/validate.middleware.js";
import { reviewsController } from "./reviews.controller.js";

const router: RouterType = Router();

router.post(
	"/",
	requireUserAuth,
	validate({ body: CreateReviewBodySchema }),
	(req, res) => reviewsController.createReview(req, res),
);

router.get(
	"/technicians/:id",
	requireUserAuth,
	validate({
		params: TechnicianIdParamsSchema,
		query: TechnicianReviewsQuerySchema,
	}),
	(req, res) => reviewsController.getTechnicianReviews(req, res),
);

export default router;
