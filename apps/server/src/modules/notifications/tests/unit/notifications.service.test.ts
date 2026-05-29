import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockRepo, mockExpo } = vi.hoisted(() => ({
  mockRepo: {
    recipientExists: vi.fn(),
    getByExpoPushToken: vi.fn(),
    upsertDevice: vi.fn(),
    deactivateByExpoPushToken: vi.fn(),
    deactivateByExpoPushTokenValue: vi.fn(),
    listActiveDevicesForRecipient: vi.fn(),
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
  });

  it("stores an Expo push token for a valid recipient", async () => {
    mockRepo.recipientExists.mockResolvedValue(true);
    mockRepo.upsertDevice.mockResolvedValue({ id: "device-1" });

    const result = await service.registerDevice({
      recipientRole: "user",
      recipientId: "user-1",
      expoPushToken: "ExponentPushToken[token-1]",
    });

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
  });
});
