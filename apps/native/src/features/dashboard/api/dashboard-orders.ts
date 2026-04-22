import apiClient from "@/src/lib/api-client";
import { safeParseResponse } from "@/src/lib/helpers/safe-parse";
import {
	type DashboardOrder,
	dashboardOrderResponseSchema,
	dashboardOrdersResponseSchema,
} from "../schemas/response.schema";

export async function getDashboardOrders(
	_technicianId: string,
): Promise<DashboardOrder[]> {
	const response = await apiClient.get("/api/orders/technician/orders");
	return safeParseResponse(
		dashboardOrdersResponseSchema,
		response.data,
		"getDashboardOrders",
	).data;
}

export async function updateDashboardOrderStatus(
	orderId: string,
	status: "accepted" | "rejected",
): Promise<DashboardOrder> {
	const response = await apiClient.patch(
		`/api/orders/technician/orders/${orderId}`,
		{ status },
	);

	return safeParseResponse(
		dashboardOrderResponseSchema,
		response.data,
		"updateDashboardOrderStatus",
	).data;
}
