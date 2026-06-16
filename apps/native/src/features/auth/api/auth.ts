import apiClient from "@/src/config/api-client";
import { safeParseResponse } from "@/src/lib/api/safe-parse";
import {
	type ForgotPasswordResponse,
	forgotPasswordResponseSchema,
	type GetCurrentUserResponse,
	getCurrentUserResponseSchema,
	type OAuthCompleteResponse,
	oauthCompleteResponseSchema,
	type OAuthStatusResponse,
	oauthStatusResponseSchema,
	type RefreshTokenResponse,
	type ResetPasswordResponse,
	refreshTokenResponseSchema,
	resetPasswordResponseSchema,
	type SignInResponse,
	type SignOutResponse,
	type SignUpResponse,
	signInResponseSchema,
	signOutResponseSchema,
	signUpResponseSchema,
} from "../schemas/response.schema";
import type {
	ForgotPasswordRequest,
	OAuthCompleteRequest,
	ResetPasswordRequest,
	SignInRequest,
	SignUpRequest,
} from "../types/auth";

export async function signUp(data: SignUpRequest): Promise<SignUpResponse> {
	const response = await apiClient.post("/api/auth/signup", data);
	return safeParseResponse(signUpResponseSchema, response.data, "signUp");
}

export async function signIn(data: SignInRequest): Promise<SignInResponse> {
	const response = await apiClient.post("/api/auth/signin", data);
	return safeParseResponse(signInResponseSchema, response.data, "signIn");
}

/**
 * Whether the OAuth-authenticated user still needs to finish their profile
 * (domain user row + active address). Bearer is auto-attached by the api-client
 * interceptor from the in-memory supabase session.
 */
export async function oauthStatus(): Promise<OAuthStatusResponse> {
	const response = await apiClient.get("/api/auth/oauth/status");
	return safeParseResponse(
		oauthStatusResponseSchema,
		response.data,
		"oauthStatus",
	);
}

export async function oauthComplete(
	data: OAuthCompleteRequest,
): Promise<OAuthCompleteResponse> {
	const response = await apiClient.post("/api/auth/oauth/complete", data);
	return safeParseResponse(
		oauthCompleteResponseSchema,
		response.data,
		"oauthComplete",
	);
}

export async function signOut(): Promise<SignOutResponse> {
	const response = await apiClient.post("/api/auth/signout");
	return safeParseResponse(signOutResponseSchema, response.data, "signOut");
}

export async function getCurrentUser(): Promise<GetCurrentUserResponse> {
	const response = await apiClient.get("/api/auth/me");
	return safeParseResponse(
		getCurrentUserResponseSchema,
		response.data,
		"getCurrentUser",
	);
}

export async function refreshSession(
	refreshToken: string,
): Promise<RefreshTokenResponse> {
	const response = await apiClient.post("/api/auth/refresh", { refreshToken });
	return safeParseResponse(
		refreshTokenResponseSchema,
		response.data,
		"refreshSession",
	);
}

export async function forgotPassword(
	data: ForgotPasswordRequest,
): Promise<ForgotPasswordResponse> {
	const response = await apiClient.post("/api/auth/forgot-password", data);
	return safeParseResponse(
		forgotPasswordResponseSchema,
		response.data,
		"forgotPassword",
	);
}

export async function resetPassword(
	data: ResetPasswordRequest,
): Promise<ResetPasswordResponse> {
	const response = await apiClient.post("/api/auth/reset-password", data);
	return safeParseResponse(
		resetPasswordResponseSchema,
		response.data,
		"resetPassword",
	);
}
