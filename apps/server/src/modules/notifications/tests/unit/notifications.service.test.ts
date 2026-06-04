import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockRepo, mockExpo } = vi.hoisted(() => ({
  mockRepo: {
    recipientExists: vi.fn(),
    getByExpoPushToken: vi.fn(),
    upsertDevice: vi.fn(),
    deactivateByExpoPushToken: vi.fn(),
    deactivateByExpoPushTokenValue: vi.fn(),
    listActiveDevicesForRecipient: vi.fn(),
    ensurePreferences: vi.fn(),
    getPreferences: vi.fn(),
    upsertPreferences: vi.fn(),
    createNotificationLog: vi.fn(),
    listLogsForRecipient: vi.fn(),
    countUnreadForRecipient: vi.fn(),
    markAllReadForRecipient: vi.fn(),
  },
  mockExpo: {
    isExpoPushToken: vi.fn(),
    sendExpoPush: vi.fn(),
  },
}));

vi.mock("../../notifications.repository.js", () => ({
  notificationsRepository: mockRepo,
}));

vi.mock("../../../../shared/expo/expo-push.js", () => mockExpo);

const { NotificationsService } = await import("../../notifications.service.js");

describe("NotificationsService", () => {
  let service: InstanceType<typeof NotificationsService>;

  beforeEach(() => {
    service = new NotificationsService();
    for (const fn of Object.values(mockRepo)) fn.mockReset();
    for (const fn of Object.values(mockExpo)) fn.mockReset();
    mockExpo.isExpoPushToken.mockReturnValue(true);
    mockRepo.getPreferences.mockResolvedValue({
      recipient_role: "user",
      recipient_id: "user-1",
      notifications_enabled: true,
      sound_enabled: true,
      vibration_enabled: true,
    });
    mockRepo.ensurePreferences.mockResolvedValue({
      recipient_role: "user",
      recipient_id: "user-1",
      notifications_enabled: true,
      sound_enabled: true,
      vibration_enabled: true,
    });
    mockRepo.createNotificationLog.mockResolvedValue({ id: "log-1" });
  });

  it("stores an Expo push token for a valid recipient", async () => {
    mockRepo.recipientExists.mockResolvedValue(true);
    mockRepo.upsertDevice.mockResolvedValue({ id: "device-1" });

    const result = await service.registerDevice({
      recipientRole: "user",
      recipientId: "user-1",
      expoPushToken: "ExponentPushToken[token-1]",
    });

    expect(mockRepo.ensurePreferences).toHaveBeenCalledWith("user", "user-1");
    expect(mockRepo.upsertDevice).toHaveBeenCalledWith({
      recipientRole: "user",
      recipientId: "user-1",
      expoPushToken: "ExponentPushToken[token-1]",
    });
    expect(result).toEqual({ id: "device-1" });
  });

  it("rejects invalid Expo push tokens", async () => {
    mockRepo.recipientExists.mockResolvedValue(true);
    mockExpo.isExpoPushToken.mockReturnValue(false);

    await expect(
      service.registerDevice({
        recipientRole: "user",
        recipientId: "user-1",
        expoPushToken: "bad-token",
      }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it("deactivates dead tokens when Expo reports DeviceNotRegistered", async () => {
    mockRepo.listActiveDevicesForRecipient.mockResolvedValue([
      { expo_push_token: "ExponentPushToken[dead]" },
    ]);
    mockExpo.sendExpoPush.mockRejectedValue(new Error("DeviceNotRegistered"));

    await service.sendPushToRecipient({
      recipientRole: "user",
      recipientId: "user-1",
      type: "order_accepted",
      title: "Accepted",
      body: "Body",
      orderId: "order-1",
      viewerRole: "user",
    });

    expect(mockRepo.deactivateByExpoPushTokenValue).toHaveBeenCalledWith(
      "ExponentPushToken[dead]",
    );
    expect(mockRepo.createNotificationLog).toHaveBeenCalledWith({
      recipientRole: "user",
      recipientId: "user-1",
      type: "order_accepted",
      title: "Accepted",
      body: "Body",
      senderName: undefined,
      senderImageUrl: undefined,
      orderId: "order-1",
      viewerRole: "user",
    });
  });

  it("returns stored preferences for a valid recipient", async () => {
    mockRepo.recipientExists.mockResolvedValue(true);
    mockRepo.getPreferences.mockResolvedValue({
      recipient_role: "technician",
      recipient_id: "tech-1",
      notifications_enabled: true,
      sound_enabled: false,
      vibration_enabled: true,
    });

    const result = await service.getPreferences("technician", "tech-1");

    expect(result).toEqual({
      recipient_role: "technician",
      recipient_id: "tech-1",
      notifications_enabled: true,
      sound_enabled: false,
      vibration_enabled: true,
    });
  });

  it("updates notification preferences for a valid recipient", async () => {
    mockRepo.recipientExists.mockResolvedValue(true);
    mockRepo.upsertPreferences.mockResolvedValue({
      recipient_role: "user",
      recipient_id: "user-1",
      notifications_enabled: false,
      sound_enabled: false,
      vibration_enabled: true,
    });

    const result = await service.updatePreferences({
      recipientRole: "user",
      recipientId: "user-1",
      notificationsEnabled: false,
      soundEnabled: false,
      vibrationEnabled: true,
    });

    expect(mockRepo.upsertPreferences).toHaveBeenCalledWith({
      recipientRole: "user",
      recipientId: "user-1",
      notificationsEnabled: false,
      soundEnabled: false,
      vibrationEnabled: true,
    });
    expect(result.notifications_enabled).toBe(false);
  });

  it("skips push delivery when notifications are disabled", async () => {
    mockRepo.getPreferences.mockResolvedValue({
      recipient_role: "user",
      recipient_id: "user-1",
      notifications_enabled: false,
      sound_enabled: true,
      vibration_enabled: true,
    });

    await service.sendPushToRecipient({
      recipientRole: "user",
      recipientId: "user-1",
      type: "order_accepted",
      title: "Accepted",
      body: "Body",
      orderId: "order-1",
      viewerRole: "user",
    });

    expect(mockRepo.listActiveDevicesForRecipient).not.toHaveBeenCalled();
    expect(mockExpo.sendExpoPush).not.toHaveBeenCalled();
    expect(mockRepo.createNotificationLog).not.toHaveBeenCalled();
  });

  it("lists notification logs for a valid recipient", async () => {
    mockRepo.recipientExists.mockResolvedValue(true);
    mockRepo.listLogsForRecipient.mockResolvedValue([{ id: "log-1" }]);

    const result = await service.listNotificationLogs({
      recipientRole: "user",
      recipientId: "user-1",
      limit: 20,
      offset: 0,
    });

    expect(mockRepo.listLogsForRecipient).toHaveBeenCalledWith(
      "user",
      "user-1",
      20,
      0,
    );
    expect(result).toEqual([{ id: "log-1" }]);
  });

  it("marks all notifications as read for a valid recipient", async () => {
    mockRepo.recipientExists.mockResolvedValue(true);

    await service.markAllRead("technician", "tech-1");

    expect(mockRepo.markAllReadForRecipient).toHaveBeenCalledWith(
      "technician",
      "tech-1",
    );
  });
});
