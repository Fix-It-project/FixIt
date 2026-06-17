import {
	infiniteQueryOptions,
	keepPreviousData,
	queryOptions,
	useInfiniteQuery,
	useQuery,
} from "@tanstack/react-query";
import {
	getTechniciansByCategory,
	searchTechniciansInCategory,
	type TechniciansSortParam,
} from "@/src/features/technicians/api/technicians";
import { technicianQueryKeys } from "@/src/features/technicians/query-keys";

export const TECHNICIAN_LIST_CACHE_MS = 60 * 1000;
export const TECHNICIAN_LIST_GC_MS = 5 * 60 * 1000;

type TechnicianListQueryParams = {
	readonly categoryId: string;
	readonly searchQuery?: string;
	readonly coords?: { latitude: number; longitude: number } | null;
	readonly sort?: TechniciansSortParam;
};

type TechnicianInfiniteListQueryParams = TechnicianListQueryParams & {
	readonly pageSize?: number;
};

export function technicianListQueryOptions({
	categoryId,
	searchQuery = "",
	coords,
	sort,
}: TechnicianListQueryParams) {
	const trimmedCategoryId = categoryId.trim();
	const trimmedQuery = searchQuery.trim();

	return queryOptions({
		queryKey: [
			...technicianQueryKeys.list(),
			trimmedCategoryId,
			trimmedQuery,
			coords?.latitude ?? null,
			coords?.longitude ?? null,
			sort ?? null,
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
		staleTime: TECHNICIAN_LIST_CACHE_MS,
		gcTime: TECHNICIAN_LIST_GC_MS,
		retry: 1,
		placeholderData: keepPreviousData,
	});
}

export function technicianInfiniteListQueryOptions({
	categoryId,
	searchQuery = "",
	coords,
	sort,
	pageSize = 20,
}: TechnicianInfiniteListQueryParams) {
	const trimmedCategoryId = categoryId.trim();
	const trimmedQuery = searchQuery.trim();

	return infiniteQueryOptions({
		queryKey: technicianQueryKeys.infiniteList(
			trimmedCategoryId,
			trimmedQuery,
			coords?.latitude ?? null,
			coords?.longitude ?? null,
			sort ?? null,
			pageSize,
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
			lastPage.length < pageSize ? undefined : allPages.length * pageSize,
		enabled: trimmedCategoryId.length > 0,
		staleTime: TECHNICIAN_LIST_CACHE_MS,
		gcTime: TECHNICIAN_LIST_GC_MS,
		retry: 1,
	});
}

/**
 * TanStack Query hook that fetches technicians for a given category.
 *
 * When `searchQuery` is provided (≥ 2 chars) it hits the search endpoint;
 * otherwise it fetches the full list.
 *
 */
export function useTechniciansQuery(params: TechnicianListQueryParams) {
	return useQuery(technicianListQueryOptions(params));
}

export function useTechniciansInfiniteQuery(
	params: TechnicianInfiniteListQueryParams,
) {
	return useInfiniteQuery(technicianInfiniteListQueryOptions(params));
}
