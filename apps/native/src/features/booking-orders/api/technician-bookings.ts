import apiClient from "@/src/lib/api-client";
import { safeParseResponse } from "@/src/lib/helpers/safe-parse";
import {
  technicianBookingResponseSchema,
  technicianBookingsResponseSchema,
  type TechnicianBooking,
} from "../schemas/response.schema";

export async function getTechnicianBookings(
  _technicianId: string,
): Promise<TechnicianBooking[]> {
  const response = await apiClient.get("/api/orders/technician/orders");
  return safeParseResponse(
    technicianBookingsResponseSchema,
    response.data,
    "getTechnicianBookings",
  ).data;
}

export async function updateTechnicianBookingStatus(
  orderId: string,
  status: "accepted" | "rejected" | "cancelled_by_technician" | "completed",
  cancellation_reason?: string,
): Promise<TechnicianBooking> {
  const response = await apiClient.patch(
    `/api/orders/technician/orders/${orderId}`,
    { status, ...(cancellation_reason !== undefined && { cancellation_reason }) },
  );

  return safeParseResponse(
    technicianBookingResponseSchema,
    response.data,
    "updateTechnicianBookingStatus",
  ).data;
}
