// Phase 4a Plan 06 — Quote-history query.
//
// Fetches the round-by-round quote history for an order, viewer-aware. Used by
// the quote-open phase UI (Plan 4b/4c) to render the negotiation timeline.
//
// Polling cadence: 4s while the user is on the quote screen so the OTHER
// party's submission becomes visible promptly without WebSocket infra. The
// foreground-only AppState listener in lib/query-client.ts means we won't
// drain battery while the app is backgrounded — refetchIntervalInBackground
// defaults to false.

import { type UseQueryResult, useQuery } from "@tanstack/react-query";

import { getUserOrderQuotes } from "../api/orders";
import { getTechOrderQuotes } from "../api/technician-bookings";
import type { OrderQuotesResponse } from "../schemas/quote.schema";
import { orderQueryKeys } from "../schemas/query-keys";

export interface UseOrderQuoteHistoryOptions {
	viewer?: "user" | "technician";
}

const QUOTE_POLL_INTERVAL_MS = 4000;

export function useOrderQuoteHistory(
	orderId: string,
	options?: UseOrderQuoteHistoryOptions,
): UseQueryResult<OrderQuotesResponse["data"]> {
	const viewer = options?.viewer ?? "user";

	return useQuery({
		queryKey: orderQueryKeys.orderQuotes(orderId, viewer),
		queryFn: async () => {
			const fetcher =
				viewer === "user" ? getUserOrderQuotes : getTechOrderQuotes;
			const res = await fetcher(orderId);
			return res.data;
		},
		enabled: !!orderId,
		refetchInterval: QUOTE_POLL_INTERVAL_MS,
		refetchIntervalInBackground: false,
	});
}
