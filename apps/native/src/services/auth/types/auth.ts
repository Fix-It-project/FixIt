// ─── Request Types ───────────────────────────────────────────────────────────

export interface SignUpRequest {
  fullName: string;
  email: string;
  phone: string;
  password?: string;
  city: string;
  street: string;
  building_no: string;
  apartment_no: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// ─── Response Types ──────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface SignUpResponse {
  user: AuthUser;
  message: string;
}

export interface SignInResponse {
  user: AuthUser;
  session: AuthSession;
}

export interface RefreshTokenResponse {
  user: AuthUser;
  session: AuthSession;
}

export interface GetCurrentUserResponse {
  user: {
    id: string;
    email: string;
    user_metadata: {
      full_name?: string;
      phone?: string;
      address?: string;
    };
  };
}

export interface SignOutResponse {
  success: boolean;
  message: string;
}

// ─── Error Types ─────────────────────────────────────────────────────────────

export interface AuthErrorResponse {
  error: string;
}

// ─── Forgot / Reset Password Types ──────────────────────────────────────────

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordRequest {
  accessToken: string;
  refreshToken: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}
