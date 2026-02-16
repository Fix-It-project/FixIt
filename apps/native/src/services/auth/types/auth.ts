// ─── Request Types ───────────────────────────────────────────────────────────

export interface SignUpRequest {
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
  address?: string;
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
