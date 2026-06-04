import { z } from "zod";

export const OrderIdParamSchema = z.object({
	id: z.string().uuid("Invalid order id"),
});

export type OrderIdParam = z.infer<typeof OrderIdParamSchema>;
