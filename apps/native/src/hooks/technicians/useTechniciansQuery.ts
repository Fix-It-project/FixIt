import { useQuery } from "@tanstack/react-query";
import {
  getTechniciansByCategory,
  searchTechniciansInCategory,
} from "@/src/services/technicians/api";
import { MOCK_TECHNICIANS_BY_CATEGORY } from "@/src/lib/mock-data";
import type { TechniciansResponse } from "@/src/services/technicians/types";

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
) {
  const trimmedQuery = searchQuery.trim();

  return useQuery<TechniciansResponse>({
    queryKey: ["technicians", categoryId, trimmedQuery],
    queryFn: async () => {
      try {
        if (trimmedQuery.length >= 2) {
          return await searchTechniciansInCategory(categoryId, trimmedQuery);
        }
        return await getTechniciansByCategory(categoryId);
      } catch {
        // Fallback to mock data during development
        console.warn(
          "[useTechniciansQuery] API unreachable, using mock data",
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
  });
}
