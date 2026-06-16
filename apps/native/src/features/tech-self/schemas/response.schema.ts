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

const earningsPointSchema = z.object({
	date: z.string(),
	amount: z.number(),
});

export const technicianWalletSchema = z.object({
	// Lifetime sum of paid payments — NOT a withdrawable balance (no ledger).
	lifetimeEarnings: z.number(),
	currency: z.string(),
	/** Last 30 Cairo days, oldest first, today last (profile area chart). */
	last30: z.array(earningsPointSchema),
});

export const technicianWalletResponseSchema = z.object({
	wallet: technicianWalletSchema,
});

export const technicianReviewSummarySchema = z.object({
	avg_rating: z.number().nullable(),
	review_count: z.number(),
	distribution: z.object({
		"1": z.number(),
		"2": z.number(),
		"3": z.number(),
		"4": z.number(),
		"5": z.number(),
	}),
});

export const technicianReviewSummaryResponseSchema = z.object({
	data: technicianReviewSummarySchema,
});

export type TechnicianSelfProfile = z.infer<typeof technicianSelfProfileSchema>;
export type TechnicianWallet = z.infer<typeof technicianWalletSchema>;
export type TechnicianReviewSummary = z.infer<
	typeof technicianReviewSummarySchema
>;
export type TechnicianSelfResponse = z.infer<
	typeof technicianSelfResponseSchema
>;
export type ProfileImageResponse = z.infer<typeof profileImageResponseSchema>;
