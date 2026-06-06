import { Router } from "express";
import type { Router as RouterType } from "express";
import {
  NotificationLogsQuerySchema,
  NotificationPreferencesBodySchema,
  PushDeviceBodySchema,
} from "../../shared/dtos/index.js";
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

router.get(
  "/user/logs",
  requireUserAuth,
  validate({ query: NotificationLogsQuerySchema }),
  notificationsController.listLogs("user"),
);

router.get(
  "/user/logs/unread-count",
  requireUserAuth,
  notificationsController.getUnreadCount("user"),
);

router.post(
  "/user/logs/mark-read-all",
  requireUserAuth,
  notificationsController.markAllRead("user"),
);

router.get(
  "/user/preferences",
  requireUserAuth,
  notificationsController.getPreferences("user"),
);

router.patch(
  "/user/preferences",
  requireUserAuth,
  validate({ body: NotificationPreferencesBodySchema }),
  notificationsController.updatePreferences("user"),
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

router.get(
  "/technician/logs",
  requireTechnicianAuth,
  validate({ query: NotificationLogsQuerySchema }),
  notificationsController.listLogs("technician"),
);

router.get(
  "/technician/logs/unread-count",
  requireTechnicianAuth,
  notificationsController.getUnreadCount("technician"),
);

router.post(
  "/technician/logs/mark-read-all",
  requireTechnicianAuth,
  notificationsController.markAllRead("technician"),
);

router.get(
  "/technician/preferences",
  requireTechnicianAuth,
  notificationsController.getPreferences("technician"),
);

router.patch(
  "/technician/preferences",
  requireTechnicianAuth,
  validate({ body: NotificationPreferencesBodySchema }),
  notificationsController.updatePreferences("technician"),
);

router.post(
  "/technician/devices/unregister",
  requireTechnicianAuth,
  validate({ body: PushDeviceBodySchema }),
  notificationsController.unregister("technician"),
);

export default router;
