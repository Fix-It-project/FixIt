// ─── Request Types ───────────────────────────────────────────────────────────

export interface TechnicianSignInRequest {
  email: string;
  password: string;
}

export interface TechnicianCheckEmailRequest {
  email: string;
}

// ─── Response Types ──────────────────────────────────────────────────────────

export interface TechnicianUser {
  id: string;
  email: string;
}

export interface TechnicianSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface TechnicianSignUpResponse {
  technician: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  message: string;
}

export interface TechnicianSignInResponse {
  technician: TechnicianUser;
  session: TechnicianSession;
}

export interface TechnicianCheckEmailResponse {
  exists: boolean;
}

export interface TechnicianSignOutResponse {
  success: boolean;
  message: string;
}

export interface TechnicianRefreshTokenResponse {
  technician: TechnicianUser;
  session: TechnicianSession;
}
