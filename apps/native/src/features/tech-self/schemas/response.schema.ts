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
	// Defaulted for rollout safety: an app updated before the server still parses.
	is_available: z.boolean().optional().default(false),

	total_orders: z.number(),
	completed_orders: z.number(),
	avg_rating: z.number().nullable().optional(),
	review_count: z.number().optional().default(0),

	// Null until the technician finishes first-time schedule setup; the route
	// gates onboarding-vs-SchedulePage on this (NOT on template count).
	schedule_setup_completed_at: z.string().nullable().optional(),
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
