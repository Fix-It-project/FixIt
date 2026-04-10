import apiClient from "@/src/lib/api-client";
import { safeParseResponse } from "@/src/lib/helpers/safe-parse";
import type { CategoriesResponse } from "../schemas/response.schema";
import { categoriesResponseSchema } from "../schemas/response.schema";

export async function getCategories(): Promise<CategoriesResponse> {
	const response = await apiClient.get("/api/categories/");
	return safeParseResponse(
		categoriesResponseSchema,
		response.data,
		"getCategories",
	);
}
