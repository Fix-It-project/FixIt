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

export interface ForgotPasswordRequest {
	email: string;
}

export interface ResetPasswordRequest {
	accessToken: string;
	refreshToken: string;
	newPassword: string;
}

// ─── Error Types ─────────────────────────────────────────────────────────────

export interface AuthErrorResponse {
	error: string;
}
