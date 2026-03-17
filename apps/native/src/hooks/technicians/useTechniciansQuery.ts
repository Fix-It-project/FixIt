import { useQuery } from "@tanstack/react-query";
import {
  getTechniciansByCategory,
  searchTechniciansInCategory,
} from "@/src/services/technicians/api";
import { MOCK_TECHNICIANS_BY_CATEGORY } from "@/src/lib/mock-data";
import type { TechnicianListItem } from "@/src/services/technicians/types";

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
  const trimmedQuery = searchQuery.trim();

  return useQuery<TechnicianListItem[]>({
    queryKey: ["technicians", categoryId, trimmedQuery, coords?.latitude ?? null, coords?.longitude ?? null],
    queryFn: async () => {
      try {
        const c = coords ?? undefined;
        if (trimmedQuery.length >= 2) {
          return await searchTechniciansInCategory(categoryId, trimmedQuery, c);
        }
        return await getTechniciansByCategory(categoryId, c);
      } catch (error) {
        // Fallback to mock data during development when server is offline
        console.warn(
          "[useTechniciansQuery] API unreachable, using mock data.",
          error,
        );
        const mock = MOCK_TECHNICIANS_BY_CATEGORY[categoryId] ?? [];

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
    // Keep cached data for 2 minutes
    staleTime: 2 * 60 * 1000,
    // Prevent automatic retries when falling back to mock data
    retry: 1,
  });
}
