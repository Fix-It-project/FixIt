import express, { type Router } from "express";
import { RangeQuerySchema } from "../../shared/dtos/index.js";
import { requireAdminAuth } from "../../shared/middlewares/admin-auth.middleware.js";
import { validate } from "../../shared/middlewares/validate.middleware.js";
import { adminDashboardController } from "./admin-dashboard.controller.js";

const router: Router = express.Router();

router.get("/summary", requireAdminAuth, adminDashboardController.getSummary);
router.get(
	"/orders-series",
	requireAdminAuth,
	validate({ query: RangeQuerySchema }),
	adminDashboardController.getOrdersSeries,
);

export default router;
