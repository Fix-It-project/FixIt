import { z } from 'zod';

export const SignUpBodySchema = z.object({
  email: z.string().email('Must be a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  street: z.string().min(1, 'Street is required'),
  building_no: z.string().optional(),
  apartment_no: z.string().optional(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
});

export const SignInBodySchema = z.object({
  email: z.string().email('Must be a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const RefreshTokenBodySchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const ForgotPasswordBodySchema = z.object({
  email: z.string().email('Must be a valid email'),
});

export const ResetPasswordBodySchema = z.object({
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export type SignUpBody = z.infer<typeof SignUpBodySchema>;
export type SignInBody = z.infer<typeof SignInBodySchema>;
export type RefreshTokenBody = z.infer<typeof RefreshTokenBodySchema>;
export type ForgotPasswordBody = z.infer<typeof ForgotPasswordBodySchema>;
export type ResetPasswordBody = z.infer<typeof ResetPasswordBodySchema>;
