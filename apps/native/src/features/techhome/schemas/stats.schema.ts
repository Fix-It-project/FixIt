import { z } from "zod";

/** Mirrors TechnicianDashboardStats from GET /api/technicians/me/stats. */
export const techHomeStatsSchema = z.object({
	earnings: z.object({
		today: z.number(),
		yesterday: z.number(),
		thisWeek: z.number(),
		daily: z.array(z.object({ date: z.string(), amount: z.number() })),
	}),
	jobs: z.object({
		doneToday: z.number(),
		thisWeek: z.number(),
		pendingCount: z.number(),
	}),
	rates: z.object({
		acceptanceRate: z.number().nullable(),
		cancellationRate: z.number().nullable(),
		rating: z.number().nullable(),
		reviewCount: z.number(),
	}),
	pendingExpiryHours: z.number(),
});

export const techHomeStatsResponseSchema = z.object({
	stats: techHomeStatsSchema,
});

export type TechHomeStats = z.infer<typeof techHomeStatsSchema>;
