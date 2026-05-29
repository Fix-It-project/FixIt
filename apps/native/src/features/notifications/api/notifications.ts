import apiClient from "@/src/config/api-client";

export async function registerUserPushDevice(expoPushToken: string): Promise<void> {
  await apiClient.post("/api/notifications/user/devices/register", {
    expo_push_token: expoPushToken,
  });
}

export async function unregisterUserPushDevice(expoPushToken: string): Promise<void> {
  await apiClient.post("/api/notifications/user/devices/unregister", {
    expo_push_token: expoPushToken,
  });
}

export async function registerTechnicianPushDevice(
  expoPushToken: string,
): Promise<void> {
  await apiClient.post("/api/notifications/technician/devices/register", {
    expo_push_token: expoPushToken,
  });
}

export async function unregisterTechnicianPushDevice(
  expoPushToken: string,
): Promise<void> {
  await apiClient.post("/api/notifications/technician/devices/unregister", {
    expo_push_token: expoPushToken,
  });
}
