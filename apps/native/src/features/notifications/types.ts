export type NotificationViewerRole = "user" | "technician";

export interface NotificationNavigationPayload {
  readonly type?: string;
  readonly orderId?: string;
  readonly viewerRole?: NotificationViewerRole;
}

export interface NotificationPreferences {
  readonly notificationsEnabled: boolean;
  readonly soundEnabled: boolean;
  readonly vibrationEnabled: boolean;
}

export interface NotificationLogItem {
  readonly id: string;
  readonly type: string;
  readonly title: string;
  readonly body: string;
  readonly senderName?: string;
  readonly senderImageUrl?: string;
  readonly orderId?: string;
  readonly viewerRole?: NotificationViewerRole;
  readonly isRead: boolean;
  readonly readAt?: string;
  readonly createdAt: string;
}
