import { useQuery } from "@tanstack/react-query";
import {
	getTechniciansByCategory,
	searchTechniciansInCategory,
	type TechniciansSortParam,
} from "@/src/features/technicians/api/technicians";
import type { TechnicianListItem } from "@/src/features/technicians/schemas/response.schema";

/**
 * TanStack Query hook that fetches technicians for a given category.
 *
 * When `searchQuery` is provided (≥ 2 chars) it hits the search endpoint;
 * otherwise it fetches the full list.
 *
 */
export function useTechniciansQuery(
	categoryId: string,
	searchQuery = "",
	coords?: { latitude: number; longitude: number } | null,
	sort?: TechniciansSortParam,
	refreshToken = 0,
) {
	const trimmedCategoryId = categoryId.trim();
	const trimmedQuery = searchQuery.trim();

	return useQuery<TechnicianListItem[]>({
		queryKey: [
			"technicians",
			trimmedCategoryId,
			trimmedQuery,
			coords?.latitude ?? null,
			coords?.longitude ?? null,
			sort ?? null,
			refreshToken,
		],
		queryFn: async () => {
			const c = coords ?? undefined;
			if (trimmedQuery.length >= 2) {
				return await searchTechniciansInCategory(
					trimmedCategoryId,
					trimmedQuery,
					c,
					sort,
				);
			}
			return await getTechniciansByCategory(trimmedCategoryId, c, sort);
		},
		enabled: trimmedCategoryId.length > 0,
		staleTime: 0,
		retry: 1,
	});
}
