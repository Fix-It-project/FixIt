import type { Router as RouterType } from "express";
import { Router } from "express";
import multer from "multer";
import {
	CreateOrderBodySchema,
	OrderIdParamsSchema,
	TechnicianUpdateOrderBodySchema,
	UserUpdateOrderBodySchema,
} from "../../shared/dtos/index.js";
import { requireTechnicianAuth } from "../../shared/middlewares/technician-auth.middleware.js";
import { requireUserAuth } from "../../shared/middlewares/user-auth.middleware.js";
import { validate } from "../../shared/middlewares/validate.middleware.js";
import { lifecycleRoutes } from "./lifecycle/index.js";
import { ordersController } from "./orders.controller.js";
import rescheduleRoutes from "./reschedule.routes.js";

const router: RouterType = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/user/orders", requireUserAuth, (req, res) =>
	ordersController.getUserOrders(req, res),
);
router.post(
	"/user/orders",
	requireUserAuth,
	upload.single("attachment"),
	validate({ body: CreateOrderBodySchema }),
	(req, res, next) => ordersController.createOrder(req, res, next),
);
router.get(
	"/user/orders/:id",
	requireUserAuth,
	validate({ params: OrderIdParamsSchema }),
	(req, res) => ordersController.getUserOrderById(req, res),
);
router.patch(
	"/user/orders/:id",
	requireUserAuth,
	validate({ params: OrderIdParamsSchema, body: UserUpdateOrderBodySchema }),
	(req, res, next) => ordersController.userUpdateOrder(req, res, next),
);

router.get("/technician/orders", requireTechnicianAuth, (req, res) =>
	ordersController.getTechnicianOrders(req, res),
);
router.get(
	"/technician/orders/:id",
	requireTechnicianAuth,
	validate({ params: OrderIdParamsSchema }),
	(req, res) => ordersController.getTechnicianOrderById(req, res),
);
router.patch(
	"/technician/orders/:id",
	requireTechnicianAuth,
	validate({
		params: OrderIdParamsSchema,
		body: TechnicianUpdateOrderBodySchema,
	}),
	(req, res, next) => ordersController.technicianUpdateOrder(req, res, next),
);

router.use(rescheduleRoutes);

router.use(lifecycleRoutes);

export default router;
