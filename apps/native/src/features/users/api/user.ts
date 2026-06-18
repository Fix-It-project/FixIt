import apiClient from "@/src/config/api-client";
import { safeParseResponse } from "@/src/lib/api/safe-parse";
import type {
	GetProfileResponse,
	GetUserStatsResponse,
	UpdateProfileResponse,
} from "../schemas/response.schema";
import {
	getProfileResponseSchema,
	getUserStatsResponseSchema,
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

export async function getUserStats(): Promise<GetUserStatsResponse> {
	const response = await apiClient.get("/api/users/me/stats");
	return safeParseResponse(
		getUserStatsResponseSchema,
		response.data,
		"getUserStats",
	);
}
