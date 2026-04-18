import apiClient from "@/src/lib/api-client";
import { safeParseResponse } from "@/src/lib/helpers/safe-parse";
import {
  scheduledEventsResponseSchema,
  type ScheduledEvent,
} from "../schemas/response.schema";

export async function getScheduledEvents(
  _technicianId: string,
): Promise<ScheduledEvent[]> {
  const response = await apiClient.get("/api/orders/technician/orders");
  return safeParseResponse(
    scheduledEventsResponseSchema,
    response.data,
    "getScheduledEvents",
  ).data;
}
