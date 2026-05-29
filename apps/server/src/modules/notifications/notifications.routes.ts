import { Router } from "express";
import type { Router as RouterType } from "express";
import { PushDeviceBodySchema } from "../../shared/dtos/index.js";
import { requireTechnicianAuth } from "../../shared/middlewares/technician-auth.middleware.js";
import { requireUserAuth } from "../../shared/middlewares/user-auth.middleware.js";
import { validate } from "../../shared/middlewares/validate.middleware.js";
import { notificationsController } from "./notifications.controller.js";

const router: RouterType = Router();

router.post(
  "/user/devices/register",
  requireUserAuth,
  validate({ body: PushDeviceBodySchema }),
  notificationsController.register("user"),
);

router.post(
  "/user/devices/unregister",
  requireUserAuth,
  validate({ body: PushDeviceBodySchema }),
  notificationsController.unregister("user"),
);

router.post(
  "/technician/devices/register",
  requireTechnicianAuth,
  validate({ body: PushDeviceBodySchema }),
  notificationsController.register("technician"),
);

router.post(
  "/technician/devices/unregister",
  requireTechnicianAuth,
  validate({ body: PushDeviceBodySchema }),
  notificationsController.unregister("technician"),
);

export default router;
