import { z } from "zod";

export const technicianSelfProfileSchema = z.object({
	id: z.string(),
	first_name: z.string(),
	last_name: z.string(),
	email: z.string(),
	phone: z.string().nullable(),
	profile_image: z.string().nullable(),
	description: z.string().nullable(),
	category_name: z.string().nullable(),

	total_orders: z.number(),
	completed_orders: z.number(),
});

export const technicianSelfResponseSchema = z.object({
	profile: technicianSelfProfileSchema,
});

export const profileImageResponseSchema = z.object({
	profile_image: z.string(),
});

export type TechnicianSelfProfile = z.infer<typeof technicianSelfProfileSchema>;
export type TechnicianSelfResponse = z.infer<
	typeof technicianSelfResponseSchema
>;
export type ProfileImageResponse = z.infer<typeof profileImageResponseSchema>;
