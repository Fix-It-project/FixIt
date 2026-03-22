import apiClient from "@/src/lib/api-client";
import { safeParseResponse } from "@/src/lib/helpers/safe-parse";
import {
  signUpResponseSchema,
  signInResponseSchema,
  signOutResponseSchema,
  getCurrentUserResponseSchema,
  refreshTokenResponseSchema,
  forgotPasswordResponseSchema,
  resetPasswordResponseSchema,
  type SignUpResponse,
  type SignInResponse,
  type SignOutResponse,
  type GetCurrentUserResponse,
  type RefreshTokenResponse,
  type ForgotPasswordResponse,
  type ResetPasswordResponse,
} from "../schemas/response.schema";
import type {
  SignUpRequest,
  SignInRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from "../types/auth";

export async function signUp(data: SignUpRequest): Promise<SignUpResponse> {
  const response = await apiClient.post("/api/auth/signup", data);
  return safeParseResponse(signUpResponseSchema, response.data, "signUp");
}

export async function signIn(data: SignInRequest): Promise<SignInResponse> {
  const response = await apiClient.post("/api/auth/signin", data);
  return safeParseResponse(signInResponseSchema, response.data, "signIn");
}

export async function signOut(): Promise<SignOutResponse> {
  const response = await apiClient.post("/api/auth/signout");
  return safeParseResponse(signOutResponseSchema, response.data, "signOut");
}

export async function getCurrentUser(): Promise<GetCurrentUserResponse> {
  const response = await apiClient.get("/api/auth/me");
  return safeParseResponse(getCurrentUserResponseSchema, response.data, "getCurrentUser");
}

export async function refreshSession(refreshToken: string): Promise<RefreshTokenResponse> {
  const response = await apiClient.post("/api/auth/refresh", { refreshToken });
  return safeParseResponse(refreshTokenResponseSchema, response.data, "refreshSession");
}

export async function forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
  const response = await apiClient.post("/api/auth/forgot-password", data);
  return safeParseResponse(forgotPasswordResponseSchema, response.data, "forgotPassword");
}

export async function resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
  const response = await apiClient.post("/api/auth/reset-password", data);
  return safeParseResponse(resetPasswordResponseSchema, response.data, "resetPassword");
}
