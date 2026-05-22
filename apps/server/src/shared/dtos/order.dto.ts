import { z } from "zod";

export const CreateOrderBodySchema = z.object({
	technician_id: z.string().uuid("technician_id must be a valid UUID"),
	service_id: z.string().uuid("service_id must be a valid UUID"),
	scheduled_date: z
		.string()
		.regex(
			/^\d{4}-\d{2}-\d{2}$/,
			"scheduled_date must be in YYYY-MM-DD format",
		),
	scheduled_start_at: z.iso.datetime().optional(),
	problem_description: z.string().optional(),
	// Phase 2 Plan 02-03 (D6): optional explicit destination address. When
	// omitted, the lifecycle service falls back to the user's single active
	// address via `addresses.is_active=true`. Ownership is enforced by both
	// the service-level fallback (scopes by user_id) and the RPC layer
	// (`destination_address_not_owned_by_user`).
	destination_address_id: z
		.string()
		.uuid("destination_address_id must be a valid UUID")
		.optional(),
});

export const UserUpdateOrderBodySchema = z.object({
	cancel: z.boolean().optional(),
	cancellation_reason: z.string().optional(),
});

export const TechnicianUpdateOrderBodySchema = z.object({
	status: z
		.enum(["accepted", "rejected", "cancelled_by_technician", "completed"])
		.optional(),
	cancellation_reason: z.string().optional(),
});

export const OrderIdParamsSchema = z.object({
	id: z.string().uuid("Order ID must be a valid UUID"),
});

export type CreateOrderBody = z.infer<typeof CreateOrderBodySchema>;
export type UserUpdateOrderBody = z.infer<typeof UserUpdateOrderBodySchema>;
export type TechnicianUpdateOrderBody = z.infer<
	typeof TechnicianUpdateOrderBodySchema
>;
export type OrderIdParams = z.infer<typeof OrderIdParamsSchema>;
