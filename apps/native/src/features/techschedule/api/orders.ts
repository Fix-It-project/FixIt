import apiClient from "@/src/config/api-client";
import { safeParseResponse } from "@/src/lib/api/safe-parse";
import {
	type TechnicianBooking,
	technicianBookingsResponseSchema,
} from "@/src/schemas/technician-order.schema";

/**
 * The technician's orders, parsed with the CANONICAL schema so this writer
 * never poisons the shared ["technician-bookings", userId] cache. Same endpoint
 * + shape as booking-orders' getTechnicianBookings.
 */
export async function getTechnicianScheduleOrders(): Promise<
	TechnicianBooking[]
> {
	const response = await apiClient.get("/api/orders/technician/orders");
	return safeParseResponse(
		technicianBookingsResponseSchema,
		response.data,
		"getTechnicianScheduleOrders",
	).data;
}
