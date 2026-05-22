// Phase 4a Plan 06 — Distance / ETA polling hook.
//
// Polls every 30s while `enabled === true` via Tanstack `refetchInterval`.
// When the caller disables (e.g. order not in tracking/arrived phase), the
// refetch interval is explicitly set to `false` so polling stops entirely.
// `refetchIntervalInBackground: false` ensures we never poll while the app
// is backgrounded — saves battery + cuts cost.

import { type UseQueryResult, useQuery } from "@tanstack/react-query";

import { getOrderDistance } from "../api/orders";
import { getTechOrderDistance } from "../api/technician-bookings";
import type { OrderDistance } from "../schemas/order-eta.schema";
import { orderQueryKeys } from "../schemas/query-keys";

export interface UseOrderDistanceOptions {
	enabled?: boolean;
	viewer?: "user" | "technician";
}

export function useOrderDistance(
	orderId: string,
	options?: UseOrderDistanceOptions,
): UseQueryResult<OrderDistance> {
	const enabled = (options?.enabled ?? true) && !!orderId;
	const viewer = options?.viewer ?? "user";

	return useQuery({
		queryKey: orderQueryKeys.orderDistance(orderId, viewer),
		queryFn: async () => {
			const fetcher =
				viewer === "user" ? getOrderDistance : getTechOrderDistance;
			const res = await fetcher(orderId);
			return res.data;
		},
		enabled,
		refetchInterval: enabled ? 30_000 : false,
		refetchIntervalInBackground: false,
	});
}
