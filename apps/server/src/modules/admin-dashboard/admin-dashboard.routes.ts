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

// Mounted separately at /api/admin/orders (orders list lives in this module).
export const ordersRouter: Router = express.Router();
ordersRouter.get("/", requireAdminAuth, adminDashboardController.getOrders);

export default router;
