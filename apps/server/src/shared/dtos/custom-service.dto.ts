import { z } from "zod";

export const CreateCustomServiceBodySchema = z
	.object({
		name: z
			.string()
			.trim()
			.min(1, "Name is required")
			.max(120, "Name too long"),
		description: z
			.string()
			.trim()
			.max(1000, "Description too long")
			.optional()
			.nullable(),
		min_price: z.number().int().positive("min_price must be positive"),
		max_price: z.number().int().positive("max_price must be positive"),
	})
	.refine((v) => v.max_price >= v.min_price, {
		message: "max_price must be greater than or equal to min_price",
		path: ["max_price"],
	});

export const CustomServiceIdParamSchema = z.object({
	id: z.string().uuid("Invalid service request id"),
});

export const RejectCustomServiceBodySchema = z.object({
	reason: z.string().trim().max(500, "Reason too long").optional(),
});

/** Query params for the server-side admin service-requests queue. */
export const CustomServicesListQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	pageSize: z.coerce.number().int().positive().max(100).default(20),
	status: z.enum(["pending", "decided"]).default("pending"),
});

export type CreateCustomServiceBody = z.infer<
	typeof CreateCustomServiceBodySchema
>;
export type CustomServiceIdParam = z.infer<typeof CustomServiceIdParamSchema>;
export type RejectCustomServiceBody = z.infer<
	typeof RejectCustomServiceBodySchema
>;
export type CustomServicesListQuery = z.infer<
	typeof CustomServicesListQuerySchema
>;
