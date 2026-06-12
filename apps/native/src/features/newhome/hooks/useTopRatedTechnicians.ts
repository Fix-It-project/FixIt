import { useQueries } from "@tanstack/react-query";
import { useAddressesQuery } from "@/src/features/addresses/hooks/useAddressesQuery";
import { useCategoriesQuery } from "@/src/features/categories/hooks/useCategoriesQuery";
import { getTechniciansByCategory } from "@/src/features/technicians/api/technicians";
import type { TechnicianListItem } from "@/src/features/technicians/schemas/response.schema";

const TOP_RATED_LIMIT = 10;

export function useTopRatedTechnicians(): {
	technicians: TechnicianListItem[];
	isLoading: boolean;
	isError: boolean;
} {
	const categoriesQuery = useCategoriesQuery();
	const addressesQuery = useAddressesQuery();
	const categories = categoriesQuery.data ?? [];
	const activeAddress =
		addressesQuery.data?.find((address) => address.is_active) ??
		addressesQuery.data?.[0];
	const coords =
		activeAddress?.latitude != null && activeAddress.longitude != null
			? {
					latitude: activeAddress.latitude,
					longitude: activeAddress.longitude,
				}
			: undefined;

	const technicianQueries = useQueries({
		queries: categories.map((category) => ({
			queryKey: [
				"newhome",
				"top-rated",
				category.id,
				coords?.latitude ?? null,
				coords?.longitude ?? null,
			] as const,
			queryFn: () => getTechniciansByCategory(category.id, coords, "top_rated"),
			enabled: categories.length > 0,
		})),
	});

	const isCategoriesLoading = categoriesQuery.isLoading;
	const isLoading =
		isCategoriesLoading || technicianQueries.some((q) => q.isLoading);
	const isError = technicianQueries.some((q) => q.isError);

	const seen = new Set<string>();
	const merged: TechnicianListItem[] = [];

	for (const query of technicianQueries) {
		if (query.data) {
			for (const tech of query.data) {
				if (!seen.has(tech.id)) {
					seen.add(tech.id);
					merged.push(tech);
				}
			}
		}
	}

	const technicians = merged
		.sort((a, b) => {
			const ratingA = a.avg_rating ?? Number.NEGATIVE_INFINITY;
			const ratingB = b.avg_rating ?? Number.NEGATIVE_INFINITY;
			if (ratingB !== ratingA) return ratingB - ratingA;
			return b.review_count - a.review_count;
		})
		.slice(0, TOP_RATED_LIMIT);

	return { technicians, isLoading, isError };
}
