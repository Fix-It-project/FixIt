export interface ExpoPushPayload {
  type: string;
  title: string;
  body: string;
  orderId?: string;
  viewerRole?: "user" | "technician";
  playSound?: boolean;
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

// A delivery receipt — fetched asynchronously after a send. `status: "error"` +
// `details.error` (e.g. "DeviceNotRegistered", "MismatchSenderId") is where FCM
// delivery problems actually surface; the send ticket alone can be "ok".
export interface ExpoPushReceipt {
  status?: "ok" | "error";
  message?: string;
  details?: Record<string, unknown>;
}

interface ExpoReceiptsResponse {
  data?: Record<string, ExpoPushReceipt>;
  errors?: Array<Record<string, unknown>>;
}

export function isExpoPushToken(token: string): boolean {
  return /^ExponentPushToken\[[^\]]+\]$|^ExpoPushToken\[[^\]]+\]$/.test(token);
}

// exp.host egress can be intermittently slow/blocked (connect timeouts). Retry
// the request itself a few times with backoff; a permanent response (bad status
// or a ticket error like DeviceNotRegistered) is NOT retried.
const PUSH_MAX_ATTEMPTS = 3;
const PUSH_BACKOFF_MS = [0, 600, 1800] as const;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function sendExpoPush(
  expoPushToken: string,
  payload: ExpoPushPayload,
): Promise<ExpoTicket | undefined> {
  const requestBody = JSON.stringify({
    to: expoPushToken,
    title: payload.title,
    body: payload.body,
    sound: payload.playSound === false ? false : "default",
    channelId: "fixit-alerts-v2",
    priority: "high",
    data: {
      type: payload.type,
      orderId: payload.orderId,
      viewerRole: payload.viewerRole,
    },
  });

  let lastNetworkError: unknown;
  for (let attempt = 0; attempt < PUSH_MAX_ATTEMPTS; attempt += 1) {
    if (attempt > 0) await delay(PUSH_BACKOFF_MS[attempt] ?? 1800);

    let response: Response;
    try {
      response = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-Encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        body: requestBody,
      });
    } catch (err) {
      // Network/connect failure (e.g. ConnectTimeout) — retry.
      lastNetworkError = err;
      continue;
    }

    // A real HTTP response arrived: parse and treat the outcome as final.
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

  throw lastNetworkError instanceof Error
    ? lastNetworkError
    : new Error("Expo push network error");
}

// Fetch delivery receipts for previously-returned ticket ids. Expo only includes
// a receipt once it's ready, so ids absent from `data` are still pending — the
// caller must treat those as unknown, never as delivered. Network failures retry
// with the same backoff as the send; a bad HTTP status throws.
export async function getExpoPushReceipts(
  receiptIds: readonly string[],
): Promise<Record<string, ExpoPushReceipt>> {
  if (receiptIds.length === 0) return {};

  const requestBody = JSON.stringify({ ids: receiptIds });

  let lastNetworkError: unknown;
  for (let attempt = 0; attempt < PUSH_MAX_ATTEMPTS; attempt += 1) {
    if (attempt > 0) await delay(PUSH_BACKOFF_MS[attempt] ?? 1800);

    let response: Response;
    try {
      response = await fetch("https://exp.host/--/api/v2/push/getReceipts", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-Encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        body: requestBody,
      });
    } catch (err) {
      lastNetworkError = err;
      continue;
    }

    const json = (await response.json().catch(() => undefined)) as
      | ExpoReceiptsResponse
      | undefined;

    if (!response.ok) {
      const message = json?.errors?.[0]?.message;
      throw new Error(
        typeof message === "string"
          ? `Expo getReceipts failed: ${message}`
          : `Expo getReceipts failed with status ${response.status}`,
      );
    }

    return json?.data ?? {};
  }

  throw lastNetworkError instanceof Error
    ? lastNetworkError
    : new Error("Expo getReceipts network error");
}
