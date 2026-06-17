import express, { type Router } from "express";
import {
	BlockHomeownerBodySchema,
	BlockTechnicianBodySchema,
	HomeownerIdParamSchema,
	OrderIdParamSchema,
	OrdersListQuerySchema,
	RangeQuerySchema,
	TechnicianIdParamSchema,
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
ordersRouter.get(
	"/",
	requireAdminAuth,
	validate({ query: OrdersListQuerySchema }),
	adminDashboardController.getOrders,
);
ordersRouter.get(
	"/export",
	requireAdminAuth,
	validate({ query: OrdersListQuerySchema }),
	adminDashboardController.exportOrders,
);
ordersRouter.get(
	"/:id",
	requireAdminAuth,
	validate({ params: OrderIdParamSchema }),
	adminDashboardController.getOrderDetail,
);

// Mounted separately at /api/admin/homeowners.
export const homeownersRouter: Router = express.Router();
homeownersRouter.get(
	"/",
	requireAdminAuth,
	adminDashboardController.getHomeowners,
);
homeownersRouter.get(
	"/:id/history",
	requireAdminAuth,
	validate({ params: HomeownerIdParamSchema }),
	adminDashboardController.getHomeownerHistory,
);
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

// Mounted separately at /api/admin/technicians.
export const techniciansRouter: Router = express.Router();
techniciansRouter.get(
	"/",
	requireAdminAuth,
	adminDashboardController.getTechnicians,
);
techniciansRouter.get(
	"/:id/history",
	requireAdminAuth,
	validate({ params: TechnicianIdParamSchema }),
	adminDashboardController.getTechnicianHistory,
);
techniciansRouter.patch(
	"/:id/verify",
	requireAdminAuth,
	validate({ params: TechnicianIdParamSchema }),
	adminDashboardController.verifyTechnician,
);
techniciansRouter.patch(
	"/:id/reject",
	requireAdminAuth,
	validate({ params: TechnicianIdParamSchema }),
	adminDashboardController.rejectTechnician,
);
techniciansRouter.patch(
	"/:id/block",
	requireAdminAuth,
	validate({
		params: TechnicianIdParamSchema,
		body: BlockTechnicianBodySchema,
	}),
	adminDashboardController.blockTechnician,
);
techniciansRouter.patch(
	"/:id/unblock",
	requireAdminAuth,
	validate({ params: TechnicianIdParamSchema }),
	adminDashboardController.unblockTechnician,
);

export default router;
