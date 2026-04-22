import { useQuery } from "@tanstack/react-query";
import {
	getTechniciansByCategory,
	searchTechniciansInCategory,
} from "@/src/features/technicians/api/technicians";
import type { TechnicianListItem } from "@/src/features/technicians/schemas/response.schema";
import { MOCK_TECHNICIANS_BY_CATEGORY } from "@/src/lib/mock-data/user";

/**
 * TanStack Query hook that fetches technicians for a given category.
 *
 * When `searchQuery` is provided (≥ 2 chars) it hits the search endpoint;
 * otherwise it fetches the full list.
 *
 * Falls back to mock data when the API is unreachable so the UI can be
 * developed independently of the server.
 */
export function useTechniciansQuery(
	categoryId: string,
	searchQuery = "",
	coords?: { latitude: number; longitude: number } | null,
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
		],
		queryFn: async () => {
			try {
				const c = coords ?? undefined;
				if (trimmedQuery.length >= 2) {
					return await searchTechniciansInCategory(
						trimmedCategoryId,
						trimmedQuery,
						c,
					);
				}
				return await getTechniciansByCategory(trimmedCategoryId, c);
			} catch (error) {
				// Fallback to mock data during development when server is offline
				console.warn(
					"[useTechniciansQuery] API unreachable, using mock data.",
					error,
				);
				const mock = MOCK_TECHNICIANS_BY_CATEGORY[trimmedCategoryId] ?? [];

				if (trimmedQuery.length >= 2) {
					const lower = trimmedQuery.toLowerCase();
					return mock.filter(
						(t) =>
							t.first_name.toLowerCase().includes(lower) ||
							t.last_name.toLowerCase().includes(lower),
					);
				}

				return mock;
			}
		},
		enabled: trimmedCategoryId.length > 0,
		// Keep cached data for 2 minutes
		staleTime: 2 * 60 * 1000,
		// Prevent automatic retries when falling back to mock data
		retry: 1,
	});
}
