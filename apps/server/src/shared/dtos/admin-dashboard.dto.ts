import { z } from "zod";

export const RangeQuerySchema = z.object({
	range: z.enum(["7d", "30d", "90d"]).default("30d"),
});

export type RangeQuery = z.infer<typeof RangeQuerySchema>;
