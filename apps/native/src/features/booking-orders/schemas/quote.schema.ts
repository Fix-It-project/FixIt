import { z } from "zod";

// Mirrors backend OrderQuote shape (apps/server/src/modules/orders/lifecycle/lifecycle.repository.ts lines 32-43).
// 5-round cap is DB-enforced (Phase 1); also encoded here at the boundary.

export const quoteRoundStatusSchema = z.enum([
	"pending",
	"accepted",
	"rejected",
	"superseded",
]);
export type QuoteRoundStatus = z.infer<typeof quoteRoundStatusSchema>;

export const orderQuoteSchema = z.object({
	id: z.string().uuid(),
	order_id: z.string().uuid(),
	round_number: z.number().int().min(1).max(5),
	proposed_by: z.enum(["user", "technician"]),
	proposer_id: z.string().uuid(),
	amount: z.number().int().nonnegative(),
	notes: z.string().nullable(),
	status: quoteRoundStatusSchema,
	created_at: z.string(),
	resolved_at: z.string().nullable(),
});
export type OrderQuote = z.infer<typeof orderQuoteSchema>;

export const orderQuoteResponseSchema = z.object({ data: orderQuoteSchema });
export type OrderQuoteResponse = z.infer<typeof orderQuoteResponseSchema>;

export const orderQuotesResponseSchema = z.object({
	data: z.array(orderQuoteSchema),
});
export type OrderQuotesResponse = z.infer<typeof orderQuotesResponseSchema>;
