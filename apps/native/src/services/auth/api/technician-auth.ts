import apiClient from "@/src/lib/api-client";
import type {
  TechnicianSignInRequest,
  TechnicianSignInResponse,
  TechnicianSignUpResponse,
  TechnicianCheckEmailRequest,
  TechnicianCheckEmailResponse,
  TechnicianSignOutResponse,
  TechnicianRefreshTokenResponse,
} from "../types/technician-auth";

// POST /api/technician-auth/check-email
export async function technicianCheckEmail(
  data: TechnicianCheckEmailRequest
): Promise<TechnicianCheckEmailResponse> {
  const response = await apiClient.post<TechnicianCheckEmailResponse>(
    "/api/technician-auth/check-email",
    data
  );
  return response.data;
}

// POST /api/technician-auth/signin
export async function technicianSignIn(
  data: TechnicianSignInRequest
): Promise<TechnicianSignInResponse> {
  const response = await apiClient.post<TechnicianSignInResponse>(
    "/api/technician-auth/signin",
    data
  );
  return response.data;
}

// POST /api/technician-auth/signup (multipart/form-data)
export async function technicianSignUp(
  formData: FormData
): Promise<TechnicianSignUpResponse> {
  const response = await apiClient.post<TechnicianSignUpResponse>(
    "/api/technician-auth/signup",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data;
}

// POST /api/technician-auth/signout
export async function technicianSignOut(): Promise<TechnicianSignOutResponse> {
  const response = await apiClient.post<TechnicianSignOutResponse>(
    "/api/technician-auth/signout"
  );
  return response.data;
}

// POST /api/technician-auth/refresh
export async function technicianRefreshSession(
  refreshToken: string
): Promise<TechnicianRefreshTokenResponse> {
  const response = await apiClient.post<TechnicianRefreshTokenResponse>(
    "/api/technician-auth/refresh",
    { refreshToken }
  );
  return response.data;
}
