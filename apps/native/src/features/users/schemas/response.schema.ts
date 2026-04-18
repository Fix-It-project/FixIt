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

export const getProfileResponseSchema = z.object({ profile: userProfileSchema });
export const updateProfileResponseSchema = z.object({ profile: userProfileSchema });

export type UserProfile = z.infer<typeof userProfileSchema>;
export type GetProfileResponse = z.infer<typeof getProfileResponseSchema>;
export type UpdateProfileResponse = z.infer<typeof updateProfileResponseSchema>;
