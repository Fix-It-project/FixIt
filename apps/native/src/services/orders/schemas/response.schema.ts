import { z } from "zod";
import { orderStatusSchema } from "@/src/schemas/shared.schema";

export const orderSchema = z.object({
  id: z.string(),
  technician_id: z.string(),
  user_id: z.string(),
  service_id: z.string(),
  scheduled_date: z.string(),
  status: orderStatusSchema,
  problem_description: z.string().nullable(),
  active: z.boolean(),
  created_at: z.string(),
});

export const orderResponseSchema = z.object({ data: orderSchema });
export const ordersResponseSchema = z.object({ data: z.array(orderSchema) });

export type Order = z.infer<typeof orderSchema>;
export type OrderResponse = z.infer<typeof orderResponseSchema>;
export type OrdersResponse = z.infer<typeof ordersResponseSchema>;
