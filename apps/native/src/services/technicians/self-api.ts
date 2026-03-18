import { z } from "zod";
import apiClient from "@/src/lib/api-client";

// ─── Schema & Types ───────────────────────────────────────────────────────────

const technicianSelfProfileSchema = z.object({
  id: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  profile_image: z.string().nullable(),
  description: z.string().nullable(),
  category_name: z.string().nullable(),
  total_orders: z.number(),
  completed_orders: z.number(),
});

const technicianSelfResponseSchema = z.object({
  profile: technicianSelfProfileSchema,
});

export type TechnicianSelfProfile = z.infer<typeof technicianSelfProfileSchema>;

export interface UpdateTechnicianSelfRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  description?: string;
}

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
  } as unknown as Blob);

  const { data } = await apiClient.post("/api/technicians/me/profile-image", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data as { profile_image: string };
}
