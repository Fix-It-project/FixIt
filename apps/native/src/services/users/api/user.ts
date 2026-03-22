import apiClient from "@/src/lib/api-client";
import { safeParseResponse } from "@/src/lib/helpers/safe-parse";
import type {
	GetProfileResponse,
	UpdateProfileResponse,
} from "../schemas/response.schema";
import {
	getProfileResponseSchema,
	updateProfileResponseSchema,
} from "../schemas/response.schema";
import type { UpdateProfileRequest } from "../types/user";

export async function getProfile(): Promise<GetProfileResponse> {
	const response = await apiClient.get("/api/users/profile");
	return safeParseResponse(
		getProfileResponseSchema,
		response.data,
		"getProfile",
	);
}

export async function updateProfile(
	data: UpdateProfileRequest,
): Promise<UpdateProfileResponse> {
	const response = await apiClient.put("/api/users/profile", data);
	return safeParseResponse(
		updateProfileResponseSchema,
		response.data,
		"updateProfile",
	);
}
