import { z } from "zod";

/**
 * Technician self-profile as returned by GET /api/technicians/me.
 *
 * CACHE CONTRACT: techhome reads/writes the SHARED ["technician", "self"]
 * cache owned by the tech-self feature. The field set below mirrors tech-self's
 * technicianSelfProfileSchema one-for-one — Zod strips unknown keys, so a
 * narrower schema here would silently strip fields for tech-self's consumers.
 * Keep the two schemas field-identical.
 */
export const techHomeSelfProfileSchema = z.object({
	id: z.string(),
	first_name: z.string(),
	last_name: z.string(),
	email: z.string(),
	phone: z.string().nullable(),
	profile_image: z.string().nullable(),
	description: z.string().nullable(),
	category_name: z.string().nullable(),
	is_available: z.boolean().optional().default(false),

	total_orders: z.number(),
	completed_orders: z.number(),
	avg_rating: z.number().nullable().optional(),
	review_count: z.number().optional().default(0),
});

export const techHomeSelfResponseSchema = z.object({
	profile: techHomeSelfProfileSchema,
});

/** Availability PATCH returns the same profile envelope. */
export const techHomeAvailabilityResponseSchema = techHomeSelfResponseSchema;

export type TechHomeSelfProfile = z.infer<typeof techHomeSelfProfileSchema>;
export type TechHomeAvailabilityResponse = z.infer<
	typeof techHomeAvailabilityResponseSchema
>;
