import {
	keepPreviousData,
	useInfiniteQuery,
	useQuery,
} from "@tanstack/react-query";
import {
	getTechniciansByCategory,
	searchTechniciansInCategory,
	type TechniciansSortParam,
} from "@/src/features/technicians/api/technicians";
import { technicianQueryKeys } from "@/src/features/technicians/query-keys";
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
			...technicianQueryKeys.list(),
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
		placeholderData: keepPreviousData,
	});
}

export function useTechniciansInfiniteQuery(
	categoryId: string,
	searchQuery = "",
	coords?: { latitude: number; longitude: number } | null,
	sort?: TechniciansSortParam,
	refreshToken = 0,
	pageSize = 20,
) {
	const trimmedCategoryId = categoryId.trim();
	const trimmedQuery = searchQuery.trim();

	return useInfiniteQuery({
		queryKey: technicianQueryKeys.infiniteList(
			trimmedCategoryId,
			trimmedQuery,
			coords?.latitude ?? null,
			coords?.longitude ?? null,
			sort ?? null,
			pageSize,
			refreshToken,
		),
		queryFn: async ({ pageParam = 0 }) => {
			const c = coords ?? undefined;
			const page = { limit: pageSize, offset: pageParam as number };
			if (trimmedQuery.length >= 2) {
				return await searchTechniciansInCategory(
					trimmedCategoryId,
					trimmedQuery,
					c,
					sort,
					page,
				);
			}
			return await getTechniciansByCategory(trimmedCategoryId, c, sort, page);
		},
		initialPageParam: 0,
		getNextPageParam: (lastPage, allPages) =>
			lastPage.length === 0 ? undefined : allPages.length * pageSize,
		enabled: trimmedCategoryId.length > 0,
		staleTime: 0,
		retry: 1,
	});
}
