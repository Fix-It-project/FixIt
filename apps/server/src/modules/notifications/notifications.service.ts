import { AppError } from "../../shared/errors/app-error.js";
import { logger } from "../../shared/logger.js";
import {
  isExpoPushToken,
  sendExpoPush,
  type ExpoPushPayload,
} from "../../shared/expo/expo-push.js";
import {
  notificationsRepository,
  type NotificationLog,
  type NotificationPreferences,
  type RecipientRole,
} from "./notifications.repository.js";

export interface RegisterDeviceInput {
  recipientRole: RecipientRole;
  recipientId: string;
  expoPushToken: string;
}

export interface UnregisterDeviceInput extends RegisterDeviceInput {}

export interface SendPushInput extends ExpoPushPayload {
  recipientRole: RecipientRole;
  recipientId: string;
  senderName?: string;
  senderImageUrl?: string;
}

export interface UpdateNotificationPreferencesInput {
  recipientRole: RecipientRole;
  recipientId: string;
  notificationsEnabled?: boolean;
  soundEnabled?: boolean;
  vibrationEnabled?: boolean;
}

export interface ListNotificationLogsInput {
  recipientRole: RecipientRole;
  recipientId: string;
  limit: number;
  offset: number;
}

function isDeviceNotRegisteredError(error: unknown): boolean {
  const message =
    error instanceof Error ? error.message : typeof error === "string" ? error : "";
  return /DeviceNotRegistered/i.test(message);
}

export class NotificationsService {
  async registerDevice(input: RegisterDeviceInput) {
    const exists = await notificationsRepository.recipientExists(
      input.recipientRole,
      input.recipientId,
    );
    if (!exists) {
      throw AppError.notFound("notification_recipient_not_found");
    }
    if (!isExpoPushToken(input.expoPushToken)) {
      throw AppError.badRequest("invalid_expo_push_token");
    }

    return notificationsRepository.upsertDevice({
      recipientRole: input.recipientRole,
      recipientId: input.recipientId,
      expoPushToken: input.expoPushToken,
    });
  }

  async unregisterDevice(input: UnregisterDeviceInput): Promise<void> {
    await notificationsRepository.deactivateByExpoPushToken(
      input.recipientRole,
      input.recipientId,
      input.expoPushToken,
    );
  }

  async getPreferences(
    recipientRole: RecipientRole,
    recipientId: string,
  ): Promise<NotificationPreferences> {
    const exists = await notificationsRepository.recipientExists(
      recipientRole,
      recipientId,
    );
    if (!exists) {
      throw AppError.notFound("notification_recipient_not_found");
    }
    return notificationsRepository.getPreferences(recipientRole, recipientId);
  }

  async updatePreferences(
    input: UpdateNotificationPreferencesInput,
  ): Promise<NotificationPreferences> {
    const exists = await notificationsRepository.recipientExists(
      input.recipientRole,
      input.recipientId,
    );
    if (!exists) {
      throw AppError.notFound("notification_recipient_not_found");
    }

    return notificationsRepository.upsertPreferences(input);
  }

  async listNotificationLogs(
    input: ListNotificationLogsInput,
  ): Promise<NotificationLog[]> {
    const exists = await notificationsRepository.recipientExists(
      input.recipientRole,
      input.recipientId,
    );
    if (!exists) {
      throw AppError.notFound("notification_recipient_not_found");
    }
    return notificationsRepository.listLogsForRecipient(
      input.recipientRole,
      input.recipientId,
      input.limit,
      input.offset,
    );
  }

  async getUnreadCount(
    recipientRole: RecipientRole,
    recipientId: string,
  ): Promise<number> {
    const exists = await notificationsRepository.recipientExists(
      recipientRole,
      recipientId,
    );
    if (!exists) {
      throw AppError.notFound("notification_recipient_not_found");
    }
    return notificationsRepository.countUnreadForRecipient(
      recipientRole,
      recipientId,
    );
  }

  async markAllRead(
    recipientRole: RecipientRole,
    recipientId: string,
  ): Promise<void> {
    const exists = await notificationsRepository.recipientExists(
      recipientRole,
      recipientId,
    );
    if (!exists) {
      throw AppError.notFound("notification_recipient_not_found");
    }
    await notificationsRepository.markAllReadForRecipient(
      recipientRole,
      recipientId,
    );
  }

  async sendPushToRecipient(input: SendPushInput): Promise<void> {
    const preferences = await notificationsRepository.getPreferences(
      input.recipientRole,
      input.recipientId,
    );
    if (!preferences.notifications_enabled) {
      return;
    }

    await notificationsRepository.createNotificationLog({
      recipientRole: input.recipientRole,
      recipientId: input.recipientId,
      type: input.type,
      title: input.title,
      body: input.body,
      senderName: input.senderName,
      senderImageUrl: input.senderImageUrl,
      orderId: input.orderId,
      viewerRole: input.viewerRole,
    });

    const devices = await notificationsRepository.listActiveDevicesForRecipient(
      input.recipientRole,
      input.recipientId,
    );
    if (devices.length === 0) return;

    const payload: ExpoPushPayload = {
      type: input.type,
      title: input.title,
      body: input.body,
      orderId: input.orderId,
      viewerRole: input.viewerRole,
      playSound: preferences.sound_enabled,
    };

    await Promise.allSettled(
      devices.map(async (device) => {
        try {
          const ticket = await sendExpoPush(device.expo_push_token, payload);
          logger.info(
            {
              recipientRole: input.recipientRole,
              recipientId: input.recipientId,
              orderId: input.orderId,
              type: input.type,
              ticket,
            },
            "[notifications] Expo push accepted",
          );
        } catch (error) {
          logger.warn(
            {
              err: error,
              expoPushToken: device.expo_push_token,
              recipientRole: input.recipientRole,
              recipientId: input.recipientId,
              orderId: input.orderId,
              type: input.type,
            },
            "[notifications] Expo push failed",
          );
          if (isDeviceNotRegisteredError(error)) {
            await notificationsRepository.deactivateByExpoPushTokenValue(
              device.expo_push_token,
            );
          }
        }
      }),
    );
  }
}

export const notificationsService = new NotificationsService();
