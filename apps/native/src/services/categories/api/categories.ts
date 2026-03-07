import apiClient from "@/src/lib/api-client";
import type { GetCategoriesResponse } from "../types/category";

export async function getCategories(): Promise<GetCategoriesResponse> {
  const response = await apiClient.get<GetCategoriesResponse>("/api/categories");
  return response.data;
}
