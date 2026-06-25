import { AppError } from "../../shared/errors/app-error.js";
import {
	type ExpoPushPayload,
	type ExpoPushReceipt,
	getExpoPushReceipts,
	isExpoPushToken,
	sendExpoPush,
} from "../../shared/expo/expo-push.js";
import { logger } from "../../shared/logger.js";
import {
	type NotificationLog,
	type NotificationPreferences,
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
	let message = "";
	if (error instanceof Error) message = error.message;
	else if (typeof error === "string") message = error;
	return /DeviceNotRegistered/i.test(message);
}

// Background receipt poll: Expo receipts are asynchronous, so we re-check a few
// times with backoff. Kept short (a server request shouldn't block on this) —
// the common delivery errors (DeviceNotRegistered, MismatchSenderId) surface
// quickly; anything still unresolved is logged as pending, never as delivered.
const RECEIPT_POLL_ATTEMPTS = 3;
const RECEIPT_POLL_BACKOFF_MS = [1500, 3000, 6000] as const;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

		await notificationsRepository.ensurePreferences(
			input.recipientRole,
			input.recipientId,
		);

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

	/** Hard-deletes all devices + preferences for a recipient (account removal). */
	async removeAllForRecipient(
		recipientRole: RecipientRole,
		recipientId: string,
	): Promise<void> {
		await notificationsRepository.deleteDevicesForRecipient(
			recipientRole,
			recipientId,
		);
		await notificationsRepository.deletePreferences(recipientRole, recipientId);
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
		if (devices.length === 0) {
			logger.info(
				{
					recipientRole: input.recipientRole,
					recipientId: input.recipientId,
					type: input.type,
				},
				"[notifications] no active devices — push skipped",
			);
			return;
		}

		const payload: ExpoPushPayload = {
			type: input.type,
			title: input.title,
			body: input.body,
			orderId: input.orderId,
			viewerRole: input.viewerRole,
			playSound: preferences.sound_enabled,
		};

		const sendResults = await Promise.allSettled(
			devices.map((device) =>
				sendExpoPush(device.expo_push_token, payload).then((ticket) => ({
					token: device.expo_push_token,
					ticket,
				})),
			),
		);

		// Map each accepted ticket's receipt id back to its token so the background
		// receipt poll can deactivate the right device on a delivery error.
		const receiptIdToToken = new Map<string, string>();
		for (const [i, result] of sendResults.entries()) {
			const device = devices[i];
			if (!device) continue;
			if (result.status === "fulfilled") {
				const { token, ticket } = result.value;
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
				if (ticket?.id) receiptIdToToken.set(ticket.id, token);
			} else {
				// Synchronous send failure (ticket error or exhausted network retries).
				logger.warn(
					{
						err: result.reason,
						expoPushToken: device.expo_push_token,
						recipientRole: input.recipientRole,
						recipientId: input.recipientId,
						orderId: input.orderId,
						type: input.type,
					},
					"[notifications] Expo push failed",
				);
				if (isDeviceNotRegisteredError(result.reason)) {
					await notificationsRepository.deactivateByExpoPushTokenValue(
						device.expo_push_token,
					);
				}
			}
		}

		// Resolve delivery receipts in the background so the caller isn't blocked on
		// Expo's async receipt latency. This is where MismatchSenderId / FCM-credential
		// problems become visible and dead tokens get soft-deactivated.
		void this.resolvePushReceipts(receiptIdToToken, {
			recipientRole: input.recipientRole,
			recipientId: input.recipientId,
			orderId: input.orderId,
			type: input.type,
		}).catch((error) => {
			logger.warn(
				{ err: error, recipientRole: input.recipientRole, type: input.type },
				"[notifications] receipt resolution crashed",
			);
		});
	}

	/**
	 * Poll Expo delivery receipts with bounded backoff. A receipt absent from the
	 * response is still pending — re-polled, and finally logged as unresolved
	 * (never treated as delivered). On a `DeviceNotRegistered` receipt the token is
	 * soft-deactivated (matching the sync path); never hard-deleted.
	 */
	private async resolvePushReceipts(
		receiptIdToToken: Map<string, string>,
		context: {
			recipientRole: RecipientRole;
			recipientId: string;
			orderId?: string;
			type: string;
		},
	): Promise<void> {
		if (receiptIdToToken.size === 0) return;

		const pending = new Set(receiptIdToToken.keys());

		for (
			let attempt = 0;
			attempt < RECEIPT_POLL_ATTEMPTS && pending.size > 0;
			attempt += 1
		) {
			await delay(RECEIPT_POLL_BACKOFF_MS[attempt] ?? 6000);

			let receipts: Record<string, ExpoPushReceipt>;
			try {
				receipts = await getExpoPushReceipts([...pending]);
			} catch (error) {
				logger.warn(
					{ err: error, ...context },
					"[notifications] receipt fetch failed — will retry",
				);
				continue;
			}

			for (const [receiptId, receipt] of Object.entries(receipts)) {
				const resolved = await this.processReceipt(
					receiptId,
					receipt,
					receiptIdToToken,
					context,
				);
				if (resolved) pending.delete(receiptId);
			}
		}

		if (pending.size > 0) {
			logger.warn(
				{ pendingReceiptIds: [...pending], ...context },
				"[notifications] push receipts unresolved (pending/unknown) — not confirmed delivered",
			);
		}
	}

	/**
	 * Resolve a single Expo receipt. Returns `false` while it is still pending
	 * (no status yet — keep polling); returns `true` once it carries a status.
	 * On an error status the token is soft-deactivated, matching the sync path.
	 */
	private async processReceipt(
		receiptId: string,
		receipt: ExpoPushReceipt | undefined,
		receiptIdToToken: Map<string, string>,
		context: {
			recipientRole: RecipientRole;
			recipientId: string;
			orderId?: string;
			type: string;
		},
	): Promise<boolean> {
		if (!receipt?.status) return false; // not ready yet — leave pending
		if (receipt.status !== "error") return true;

		const token = receiptIdToToken.get(receiptId);
		const detail =
			typeof receipt.details?.error === "string"
				? receipt.details.error
				: undefined;
		logger.warn(
			{
				receiptId,
				expoPushToken: token,
				detail,
				message: receipt.message,
				...context,
			},
			"[notifications] push receipt reported an error",
		);
		if (
			token &&
			(detail === "DeviceNotRegistered" ||
				isDeviceNotRegisteredError(detail ?? receipt.message))
		) {
			await notificationsRepository.deactivateByExpoPushTokenValue(token);
		}
		return true;
	}
}

export const notificationsService = new NotificationsService();
