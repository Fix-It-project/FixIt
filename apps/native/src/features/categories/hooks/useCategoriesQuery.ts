import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/src/features/categories/api/categories";

export function useCategoriesQuery() {
	return useQuery({
		queryKey: ["categories"],
		queryFn: getCategories,
		select: (data) => data.categories,
		staleTime: 5 * 60 * 1000,
	});
}
