export interface ExpoPushPayload {
  type: string;
  title: string;
  body: string;
  orderId?: string;
  viewerRole?: "user" | "technician";
}

interface ExpoTicket {
  status?: "ok" | "error";
  id?: string;
  message?: string;
  details?: Record<string, unknown>;
}

interface ExpoPushResponse {
  data?: ExpoTicket | ExpoTicket[];
  errors?: Array<Record<string, unknown>>;
}

export function isExpoPushToken(token: string): boolean {
  return /^ExponentPushToken\[[^\]]+\]$|^ExpoPushToken\[[^\]]+\]$/.test(token);
}

export async function sendExpoPush(
  expoPushToken: string,
  payload: ExpoPushPayload,
): Promise<ExpoTicket | undefined> {
  const response = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-Encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: expoPushToken,
      title: payload.title,
      body: payload.body,
      sound: "default",
      data: {
        type: payload.type,
        orderId: payload.orderId,
        viewerRole: payload.viewerRole,
      },
    }),
  });

  const json = (await response.json().catch(() => undefined)) as
    | ExpoPushResponse
    | undefined;

  if (!response.ok) {
    const message = json?.errors?.[0]?.message;
    throw new Error(
      typeof message === "string"
        ? `Expo push request failed: ${message}`
        : `Expo push request failed with status ${response.status}`,
    );
  }

  const ticket = Array.isArray(json?.data) ? json?.data[0] : json?.data;
  if (ticket?.status === "error") {
    const detailsError =
      typeof ticket.details?.error === "string" ? ticket.details.error : undefined;
    throw new Error(detailsError ?? ticket.message ?? "Expo push ticket error");
  }
  return ticket;
}
