import type { Request, RequestHandler } from "express";
import { asyncHandler } from "../../shared/errors/async-handler.js";
import { notificationsService } from "./notifications.service.js";
import { requireActorId, type AuthActor } from "../../shared/utils/request-auth.js";

export class NotificationsController {
  listLogs = (actor: AuthActor): RequestHandler =>
    asyncHandler(async (req: Request, res) => {
      const recipientId = requireActorId(req, actor);
      const logs = await notificationsService.listNotificationLogs({
        recipientRole: actor,
        recipientId,
        limit: Number(req.query.limit ?? 20),
        offset: Number(req.query.offset ?? 0),
      });
      res.status(200).json({ data: logs });
    });

  getUnreadCount = (actor: AuthActor): RequestHandler =>
    asyncHandler(async (req: Request, res) => {
      const recipientId = requireActorId(req, actor);
      const unreadCount = await notificationsService.getUnreadCount(
        actor,
        recipientId,
      );
      res.status(200).json({ data: { unread_count: unreadCount } });
    });

  markAllRead = (actor: AuthActor): RequestHandler =>
    asyncHandler(async (req: Request, res) => {
      const recipientId = requireActorId(req, actor);
      await notificationsService.markAllRead(actor, recipientId);
      req.log.info({
        action: "notification_logs_marked_read",
        recipientRole: actor,
        recipientId,
      });
      res.status(200).json({ success: true });
    });

  getPreferences = (actor: AuthActor): RequestHandler =>
    asyncHandler(async (req: Request, res) => {
      const recipientId = requireActorId(req, actor);
      const preferences = await notificationsService.getPreferences(
        actor,
        recipientId,
      );
      res.status(200).json({ data: preferences });
    });

  updatePreferences = (actor: AuthActor): RequestHandler =>
    asyncHandler(async (req: Request, res) => {
      const recipientId = requireActorId(req, actor);
      const preferences = await notificationsService.updatePreferences({
        recipientRole: actor,
        recipientId,
        notificationsEnabled: req.body.notifications_enabled,
        soundEnabled: req.body.sound_enabled,
        vibrationEnabled: req.body.vibration_enabled,
      });
      req.log.info({
        action: "notification_preferences_updated",
        recipientRole: actor,
        recipientId,
      });
      res.status(200).json({ data: preferences });
    });

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
