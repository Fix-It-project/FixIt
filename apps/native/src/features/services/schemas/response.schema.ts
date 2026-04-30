import { z } from "zod";

export const serviceSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string(),
	min_price: z.number(),
	max_price: z.number(),
	category_id: z.string(),
	created_at: z.string(),
});

export const servicesResponseSchema = z.object({
	services: z.array(serviceSchema),
});

export type Service = z.infer<typeof serviceSchema>;
export type ServicesResponse = z.infer<typeof servicesResponseSchema>;
