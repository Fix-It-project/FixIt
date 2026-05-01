import apiClient from "@/src/lib/api-client";
import { safeParseResponse } from "@/src/lib/helpers/safe-parse";
import type { ServicesResponse } from "../schemas/response.schema";
import { servicesResponseSchema } from "../schemas/response.schema";

export async function getServicesByCategory(
	categoryId: string,
): Promise<ServicesResponse> {
	const response = await apiClient.get(
		`/api/categories/${categoryId}/services`,
	);
	return safeParseResponse(
		servicesResponseSchema,
		response.data,
		"getServicesByCategory",
	);
}
