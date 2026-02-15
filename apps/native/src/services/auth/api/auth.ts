import apiClient from "@/src/lib/api-client";
import type {
  SignUpRequest,
  SignInRequest,
  SignUpResponse,
  SignInResponse,
  SignOutResponse,
  GetCurrentUserResponse,
  RefreshTokenResponse,
} from "../types/auth";

//sign up, sign in, sign out, get current user, refresh token
export async function signUp(data: SignUpRequest): Promise<SignUpResponse> {
  const response = await apiClient.post<SignUpResponse>("/api/auth/signup", data);
  return response.data;
}
export async function signIn(data: SignInRequest): Promise<SignInResponse> {
  const response = await apiClient.post<SignInResponse>("/api/auth/signin", data);
  return response.data;
}

export async function signOut(): Promise<SignOutResponse> {
  const response = await apiClient.post<SignOutResponse>("/api/auth/signout");
  return response.data;
}

export async function getCurrentUser(): Promise<GetCurrentUserResponse> {
  const response = await apiClient.get<GetCurrentUserResponse>("/api/auth/me");
  return response.data;
}

export async function refreshSession(refreshToken: string): Promise<RefreshTokenResponse> {
  const response = await apiClient.post<RefreshTokenResponse>("/api/auth/refresh", {
    refreshToken,
  });
  return response.data;
}
