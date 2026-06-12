import { type UseQueryResult, useQuery } from "@tanstack/react-query";
import { getInspectionFeePreview } from "../api/orders";
import type { InspectionFeePreview } from "../schemas";
import { orderQueryKeys } from "../schemas/query-keys";

export function useInspectionFeePreview(
	technicianId: string,
	destinationAddressId: string | undefined,
): UseQueryResult<InspectionFeePreview> {
	const enabled = !!technicianId && !!destinationAddressId;

	return useQuery({
		queryKey: orderQueryKeys.inspectionFeePreview(
			technicianId,
			destinationAddressId ?? "missing",
		),
		queryFn: async () => {
			const response = await getInspectionFeePreview(
				technicianId,
				destinationAddressId as string,
			);
			return response.data;
		},
		enabled,
		retry: false,
		meta: { showToast: false },
	});
}
