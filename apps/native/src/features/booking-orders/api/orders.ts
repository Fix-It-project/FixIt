import apiClient from "@/src/lib/api-client";
import { safeParseResponse } from "@/src/lib/helpers/safe-parse";
import type { OrderResponse, OrdersResponse } from "../schemas/response.schema";
import {
	orderResponseSchema,
	ordersResponseSchema,
} from "../schemas/response.schema";
import type { CreateOrderPayload } from "../types/order";

export interface CreateOrderOptions {
	payload: CreateOrderPayload;
	attachment?: { uri: string; name: string; type: string };
}

export async function createOrder(
	options: CreateOrderOptions,
): Promise<OrderResponse> {
	const { payload, attachment } = options;

	if (attachment) {
		const form = new FormData();
		form.append("technician_id", payload.technician_id);
		form.append("service_id", payload.service_id);
		form.append("scheduled_date", payload.scheduled_date);
		if (payload.problem_description) {
			form.append("problem_description", payload.problem_description);
		}
		form.append("attachment", {
			uri: attachment.uri,
			name: attachment.name,
			type: attachment.type,
		} as any);

		const response = await apiClient.post("/api/orders/user/orders", form, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return safeParseResponse(orderResponseSchema, response.data, "createOrder");
	}

	const response = await apiClient.post("/api/orders/user/orders", payload);
	return safeParseResponse(orderResponseSchema, response.data, "createOrder");
}

export async function getUserOrders(): Promise<OrdersResponse> {
	const response = await apiClient.get("/api/orders/user/orders");
	return safeParseResponse(
		ordersResponseSchema,
		response.data,
		"getUserOrders",
	);
}

export async function cancelUserOrder(
	orderId: string,
	reason?: string,
): Promise<OrderResponse> {
	const response = await apiClient.patch(`/api/orders/user/orders/${orderId}`, {
		cancel: true,
		...(reason && { cancellation_reason: reason }),
	});
	return safeParseResponse(
		orderResponseSchema,
		response.data,
		"cancelUserOrder",
	);
}
