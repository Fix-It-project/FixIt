import apiClient from "@/src/lib/api-client";
import { safeParseResponse } from "@/src/lib/helpers/safe-parse";
import type { OrderResponse } from "../schemas/response.schema";
import { orderResponseSchema } from "../schemas/response.schema";
import type { CreateOrderPayload } from "../types/order";

export async function createOrder(
	payload: CreateOrderPayload,
): Promise<OrderResponse> {
	const response = await apiClient.post("/api/orders/user/orders", payload);
	return safeParseResponse(orderResponseSchema, response.data, "createOrder");
}
