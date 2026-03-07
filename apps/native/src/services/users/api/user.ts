import apiClient from "@/src/lib/api-client";
import type {
  GetProfileResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
} from "../types/user";

export async function getProfile(): Promise<GetProfileResponse> {
  const response = await apiClient.get<GetProfileResponse>("/api/users/profile");
  return response.data;
}

export async function updateProfile(data: UpdateProfileRequest): Promise<UpdateProfileResponse> {
  const response = await apiClient.put<UpdateProfileResponse>("/api/users/profile", data);
  return response.data;
}
