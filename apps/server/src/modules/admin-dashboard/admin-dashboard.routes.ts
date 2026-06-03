import express, { type Router } from "express";
import {
	BlockHomeownerBodySchema,
	HomeownerIdParamSchema,
	OrderIdParamSchema,
	RangeQuerySchema,
} from "../../shared/dtos/index.js";
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
ordersRouter.get(
	"/:id",
	requireAdminAuth,
	validate({ params: OrderIdParamSchema }),
	adminDashboardController.getOrderDetail,
);

// Mounted separately at /api/admin/homeowners.
export const homeownersRouter: Router = express.Router();
homeownersRouter.get("/", requireAdminAuth, adminDashboardController.getHomeowners);
homeownersRouter.patch(
	"/:id/block",
	requireAdminAuth,
	validate({ params: HomeownerIdParamSchema, body: BlockHomeownerBodySchema }),
	adminDashboardController.blockHomeowner,
);
homeownersRouter.patch(
	"/:id/unblock",
	requireAdminAuth,
	validate({ params: HomeownerIdParamSchema }),
	adminDashboardController.unblockHomeowner,
);

export default router;
