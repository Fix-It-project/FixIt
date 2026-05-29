export type NotificationViewerRole = "user" | "technician";

export interface NotificationNavigationPayload {
  readonly type?: string;
  readonly orderId?: string;
  readonly viewerRole?: NotificationViewerRole;
}
