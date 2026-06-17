import { z } from "zod";

export const RangeQuerySchema = z.object({
	range: z.enum(["7d", "30d", "90d"]).default("30d"),
});

export type RangeQuery = z.infer<typeof RangeQuerySchema>;

/** Query params for the server-side admin orders list (pagination + filters). */
export const OrdersListQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	pageSize: z.coerce.number().int().positive().max(100).default(20),
	status: z
		.enum(["all", "pending", "accepted", "active", "completed", "cancelled"])
		.default("all"),
	search: z.string().trim().max(100).optional(),
	date: z.enum(["all", "today", "7d", "30d", "90d"]).default("all"),
	amount: z
		.enum(["all", "lt100", "100_500", "500_1000", "gt1000"])
		.default("all"),
});

export type OrdersListQuery = z.infer<typeof OrdersListQuerySchema>;
