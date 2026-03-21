import { z } from "zod";
import { authSessionSchema } from "@/src/schemas/shared.schema";

// ─── User Auth Responses ─────────────────────────────────────────────────────

export const authUserSchema = z.object({
  id: z.string(),
  email: z.string(),
});
export type AuthUser = z.infer<typeof authUserSchema>;

export const signUpResponseSchema = z.object({
  user: authUserSchema,
  message: z.string(),
});
export type SignUpResponse = z.infer<typeof signUpResponseSchema>;

export const signInResponseSchema = z.object({
  user: authUserSchema,
  session: authSessionSchema,
});
export type SignInResponse = z.infer<typeof signInResponseSchema>;

export const signOutResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type SignOutResponse = z.infer<typeof signOutResponseSchema>;

export const getCurrentUserResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string(),
    user_metadata: z.object({
      full_name: z.string().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
    }),
  }),
});
export type GetCurrentUserResponse = z.infer<typeof getCurrentUserResponseSchema>;

export const refreshTokenResponseSchema = z.object({
  user: authUserSchema,
  session: authSessionSchema,
});
export type RefreshTokenResponse = z.infer<typeof refreshTokenResponseSchema>;

export const forgotPasswordResponseSchema = z.object({
  message: z.string(),
});
export type ForgotPasswordResponse = z.infer<typeof forgotPasswordResponseSchema>;

export const resetPasswordResponseSchema = z.object({
  message: z.string(),
  user: z.unknown(),
});
export type ResetPasswordResponse = z.infer<typeof resetPasswordResponseSchema>;

// ─── Technician Auth Responses ───────────────────────────────────────────────

const technicianUserSchema = z.object({
  id: z.string(),
  email: z.string(),
});

export const techCheckEmailResponseSchema = z.object({
  exists: z.boolean(),
});
export type TechCheckEmailResponse = z.infer<typeof techCheckEmailResponseSchema>;

export const techSignUpResponseSchema = z.object({
  technician: z.object({
    id: z.string(),
    email: z.string(),
    first_name: z.string(),
    last_name: z.string(),
  }),
  message: z.string(),
});
export type TechSignUpResponse = z.infer<typeof techSignUpResponseSchema>;

export const techSignInResponseSchema = z.object({
  technician: technicianUserSchema,
  session: authSessionSchema,
});
export type TechSignInResponse = z.infer<typeof techSignInResponseSchema>;

export const techSignOutResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type TechSignOutResponse = z.infer<typeof techSignOutResponseSchema>;

export const techRefreshTokenResponseSchema = z.object({
  technician: technicianUserSchema,
  session: authSessionSchema,
});
export type TechRefreshTokenResponse = z.infer<typeof techRefreshTokenResponseSchema>;
