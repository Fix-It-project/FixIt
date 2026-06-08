import { z } from 'zod';

export const TechnicianSignUpBodySchema = z.object({
  email: z.string().email('Must be a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  first_name: z.string().min(1, 'first_name is required'),
  last_name: z.string().min(1, 'last_name is required'),
  phone: z.string().optional(),
  category_id: z.string().uuid('category_id must be a valid UUID'),
  city: z.string().min(1, 'City is required'),
  street: z.string().min(1, 'Street is required'),
  building_no: z.string().optional(),
  apartment_no: z.string().optional(),
  latitude: z.coerce.number().optional().nullable(),
  longitude: z.coerce.number().optional().nullable(),
  // Optional Expo push token captured at signup so we can notify the technician
  // when an admin verifies them (a pending tech cannot reach the auth-gated
  // device-register endpoint). Best-effort; absent on iOS / denied permission.
  expo_push_token: z.string().optional(),
});

export const TechnicianSignInBodySchema = z.object({
  email: z.string().email('Must be a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const TechnicianRefreshTokenBodySchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const CheckEmailBodySchema = z.object({
  email: z.string().email('Must be a valid email'),
});

export const CancelApplicationBodySchema = z.object({
  email: z.string().email('Must be a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export type TechnicianSignUpBody = z.infer<typeof TechnicianSignUpBodySchema>;
export type TechnicianSignInBody = z.infer<typeof TechnicianSignInBodySchema>;
export type CheckEmailBody = z.infer<typeof CheckEmailBodySchema>;
