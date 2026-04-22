import apiClient from "@/src/lib/api-client";
import { safeParseResponse } from "@/src/lib/helpers/safe-parse";
import {
	type ProfileImageResponse,
	profileImageResponseSchema,
	type TechnicianSelfProfile,
	technicianSelfResponseSchema,
} from "../schemas/response.schema";
import type { UpdateTechnicianSelfRequest } from "../types/tech-self";

export async function getTechnicianSelf(): Promise<TechnicianSelfProfile> {
	const { data } = await apiClient.get("/api/technicians/me");
	return safeParseResponse(
		technicianSelfResponseSchema,
		data,
		"getTechnicianSelf",
	).profile;
}

export async function updateTechnicianSelf(
	payload: UpdateTechnicianSelfRequest,
): Promise<TechnicianSelfProfile> {
	const { data } = await apiClient.put("/api/technicians/me", payload);
	return safeParseResponse(
		technicianSelfResponseSchema,
		data,
		"updateTechnicianSelf",
	).profile;
}

export async function uploadTechnicianProfileImage(
	imageUri: string,
	mimeType: string,
): Promise<ProfileImageResponse> {
	const form = new FormData();
	form.append("profile_image", {
		uri: imageUri,
		type: mimeType,
		name: "profile.jpg",
	} as unknown as Blob);

	const { data } = await apiClient.post(
		"/api/technicians/me/profile-image",
		form,
		{
			headers: { "Content-Type": "multipart/form-data" },
		},
	);
	return safeParseResponse(
		profileImageResponseSchema,
		data,
		"uploadTechnicianProfileImage",
	);
}
