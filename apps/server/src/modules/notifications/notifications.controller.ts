import type { Request, RequestHandler } from "express";
import { asyncHandler } from "../../shared/errors/async-handler.js";
import { notificationsService } from "./notifications.service.js";
import { requireActorId, type AuthActor } from "../../shared/utils/request-auth.js";

export class NotificationsController {
  register = (actor: AuthActor): RequestHandler =>
    asyncHandler(async (req: Request, res) => {
      const recipientId = requireActorId(req, actor);
      const device = await notificationsService.registerDevice({
        recipientRole: actor,
        recipientId,
        expoPushToken: req.body.expo_push_token,
      });
      req.log.info({
        action: "push_device_registered",
        recipientRole: actor,
        recipientId,
      });
      res.status(200).json({ data: device });
    });

  unregister = (actor: AuthActor): RequestHandler =>
    asyncHandler(async (req: Request, res) => {
      const recipientId = requireActorId(req, actor);
      await notificationsService.unregisterDevice({
        recipientRole: actor,
        recipientId,
        expoPushToken: req.body.expo_push_token,
      });
      req.log.info({
        action: "push_device_unregistered",
        recipientRole: actor,
        recipientId,
      });
      res.status(200).json({ success: true });
    });
}

export const notificationsController = new NotificationsController();
