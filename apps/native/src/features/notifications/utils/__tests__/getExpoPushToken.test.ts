import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockNotifications, mockPlatform, mockConstants } = vi.hoisted(() => ({
  mockNotifications: {
    getPermissionsAsync: vi.fn(),
    requestPermissionsAsync: vi.fn(),
    getExpoPushTokenAsync: vi.fn(),
  },
  mockPlatform: { OS: "android" },
  mockConstants: {
    expoConfig: { extra: { eas: { projectId: "project-123" } } },
    easConfig: undefined,
  },
}));

vi.mock("expo-notifications", () => mockNotifications);
vi.mock("expo-constants", () => ({ default: mockConstants }));
vi.mock("react-native", () => ({ Platform: mockPlatform }));
vi.mock("@/src/lib/logger", () => ({
  logger: {
    warn: vi.fn(),
  },
}));

const { getExpoPushToken } = await import("../getExpoPushToken");

describe("getExpoPushToken", () => {
  beforeEach(() => {
    mockPlatform.OS = "android";
    mockConstants.expoConfig = { extra: { eas: { projectId: "project-123" } } };
    mockConstants.easConfig = undefined;
    mockNotifications.getPermissionsAsync.mockReset();
    mockNotifications.requestPermissionsAsync.mockReset();
    mockNotifications.getExpoPushTokenAsync.mockReset();
  });

  it("returns null on non-android platforms", async () => {
    mockPlatform.OS = "ios";

    await expect(getExpoPushToken()).resolves.toBeUndefined();
  });

  it("returns the Expo push token when permission is already granted", async () => {
    mockNotifications.getPermissionsAsync.mockResolvedValue({
      granted: true,
      status: "granted",
    });
    mockNotifications.getExpoPushTokenAsync.mockResolvedValue({
      data: "ExponentPushToken[token-1]",
    });

    await expect(getExpoPushToken()).resolves.toBe("ExponentPushToken[token-1]");
    expect(mockNotifications.getExpoPushTokenAsync).toHaveBeenCalledWith({
      projectId: "project-123",
    });
  });

  it("returns null when permission stays denied", async () => {
    mockNotifications.getPermissionsAsync.mockResolvedValue({
      granted: false,
      status: "denied",
    });
    mockNotifications.requestPermissionsAsync.mockResolvedValue({
      granted: false,
      status: "denied",
    });

    await expect(getExpoPushToken()).resolves.toBeUndefined();
  });
});
