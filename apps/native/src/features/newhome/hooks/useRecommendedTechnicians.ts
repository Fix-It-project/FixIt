import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useAddressesQuery } from "@/src/features/addresses/hooks/useAddressesQuery";
import { getRecommendedTechnicians } from "@/src/features/technicians/recommendations.service";
import type { RecommendedTechnicianApi } from "@/src/features/technicians/schemas/response.schema";

const HOME_RECOMMENDATION_LIMIT = 8;
const HOME_RECOMMENDATION_PROBLEM = "General home service needed";

export function useRecommendedTechnicians(): {
	technicians: RecommendedTechnicianApi[];
	isLoading: boolean;
	isError: boolean;
} {
	const addressesQuery = useAddressesQuery();
	const coords = useMemo(() => {
		const address =
			addressesQuery.data?.find(
				(item) =>
					item.is_active && item.latitude != null && item.longitude != null,
			) ??
			addressesQuery.data?.find(
				(item) => item.latitude != null && item.longitude != null,
			);

		if (address?.latitude == null || address.longitude == null) return null;

		return {
			latitude: address.latitude,
			longitude: address.longitude,
		};
	}, [addressesQuery.data]);

	const recommendationsQuery = useQuery({
		queryKey: [
			"newhome",
			"recommended",
			coords?.latitude ?? null,
			coords?.longitude ?? null,
			HOME_RECOMMENDATION_PROBLEM,
		] as const,
		queryFn: () =>
			getRecommendedTechnicians({
				problemDescription: HOME_RECOMMENDATION_PROBLEM,
				latitude: coords?.latitude,
				longitude: coords?.longitude,
				topK: HOME_RECOMMENDATION_LIMIT,
			}),
		enabled: coords != null,
		staleTime: 60 * 1000,
		retry: 1,
	});

	return {
		technicians: recommendationsQuery.data ?? [],
		isLoading:
			addressesQuery.isLoading ||
			(coords != null && recommendationsQuery.isLoading),
		isError: recommendationsQuery.isError,
	};
}
