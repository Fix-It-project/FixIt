import { z } from "zod";

const userProfileAddressSchema = z.object({
	id: z.string(),
	city: z.string(),
	street: z.string(),
	building_no: z.string().nullable(),
	apartment_no: z.string().nullable(),
});

export const userProfileSchema = z.object({
	id: z.string(),
	email: z.string().nullable(),
	full_name: z.string().nullable(),
	phone: z.string().nullable(),
	created_at: z.string(),
	addresses: z.array(userProfileAddressSchema),
});

export const getProfileResponseSchema = z.object({
	profile: userProfileSchema,
});
export const updateProfileResponseSchema = z.object({
	profile: userProfileSchema,
});

export const userStatsSchema = z.object({
	totalBookings: z.number(),
	completedBookings: z.number(),
	mostBookedCategory: z
		.object({ name: z.string(), count: z.number() })
		.nullable(),
	memberSince: z.string().nullable(),
});

export const getUserStatsResponseSchema = z.object({
	stats: userStatsSchema,
});

export type UserProfile = z.infer<typeof userProfileSchema>;
export type GetProfileResponse = z.infer<typeof getProfileResponseSchema>;
export type UpdateProfileResponse = z.infer<typeof updateProfileResponseSchema>;
export type UserStats = z.infer<typeof userStatsSchema>;
export type GetUserStatsResponse = z.infer<typeof getUserStatsResponseSchema>;
