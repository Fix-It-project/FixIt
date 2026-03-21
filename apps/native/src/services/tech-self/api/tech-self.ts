import apiClient from "@/src/lib/api-client";
import {
  technicianSelfResponseSchema,
  type TechnicianSelfProfile,
  type UpdateTechnicianSelfRequest,
} from "../types/tech-self";

// ─── API Functions ────────────────────────────────────────────────────────────

export async function getTechnicianSelf(): Promise<TechnicianSelfProfile> {
  const { data } = await apiClient.get("/api/technicians/me");
  return technicianSelfResponseSchema.parse(data).profile;
}

export async function updateTechnicianSelf(
  payload: UpdateTechnicianSelfRequest,
): Promise<TechnicianSelfProfile> {
  const { data } = await apiClient.put("/api/technicians/me", payload);
  return technicianSelfResponseSchema.parse(data).profile;
}

export async function uploadTechnicianProfileImage(
  imageUri: string,
  mimeType: string,
): Promise<{ profile_image: string }> {
  const form = new FormData();
  form.append("profile_image", {
    uri: imageUri,
    type: mimeType,
    name: "profile.jpg",
  } as unknown as Blob); // Platform workaround: RN FormData requires Blob cast

  const { data } = await apiClient.post<{ profile_image: string }>("/api/technicians/me/profile-image", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
