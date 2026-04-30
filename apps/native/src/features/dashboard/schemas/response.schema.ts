import { z } from "zod";
import { orderStatusSchema } from "@/src/schemas/shared.schema";

export const dashboardOrderSchema = z.object({
	id: z.string(),
	status: orderStatusSchema,
	scheduled_date: z.string(),
	problem_description: z.string().nullable(),
	created_at: z.string(),
	user_address: z.string().nullable().optional(),
});

export const dashboardOrdersResponseSchema = z.object({
	data: z.array(dashboardOrderSchema),
});

export const dashboardOrderResponseSchema = z.object({
	data: dashboardOrderSchema,
});

export type DashboardOrder = z.infer<typeof dashboardOrderSchema>;
export type DashboardOrdersResponse = z.infer<
	typeof dashboardOrdersResponseSchema
>;
export type DashboardOrderResponse = z.infer<
	typeof dashboardOrderResponseSchema
>;
