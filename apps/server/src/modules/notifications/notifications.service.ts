import { AppError } from "../../shared/errors/app-error.js";
import { logger } from "../../shared/logger.js";
import {
  isExpoPushToken,
  sendExpoPush,
  type ExpoPushPayload,
} from "../../shared/expo/expo-push.js";
import {
  notificationsRepository,
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

  async sendPushToRecipient(input: SendPushInput): Promise<void> {
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
