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

router.get("/user/orders", requireUserAuth, ordersController.getUserOrders);
router.post(
	"/user/orders",
	requireUserAuth,
	upload.single("attachment"),
	validate({ body: CreateOrderBodySchema }),
	ordersController.createOrder,
);
router.get(
	"/user/orders/:id",
	requireUserAuth,
	validate({ params: OrderIdParamsSchema }),
	ordersController.getUserOrderById,
);
router.patch(
	"/user/orders/:id",
	requireUserAuth,
	validate({ params: OrderIdParamsSchema, body: UserUpdateOrderBodySchema }),
	ordersController.userUpdateOrder,
);

router.get("/technician/orders", requireTechnicianAuth, ordersController.getTechnicianOrders);
router.get(
	"/technician/orders/:id",
	requireTechnicianAuth,
	validate({ params: OrderIdParamsSchema }),
	ordersController.getTechnicianOrderById,
);
router.patch(
	"/technician/orders/:id",
	requireTechnicianAuth,
	validate({
		params: OrderIdParamsSchema,
		body: TechnicianUpdateOrderBodySchema,
	}),
	ordersController.technicianUpdateOrder,
);

router.use(rescheduleRoutes);

router.use(lifecycleRoutes);

export default router;
