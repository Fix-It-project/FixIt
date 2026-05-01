import apiClient from "@/src/lib/api-client";
import { safeParseResponse } from "@/src/lib/helpers/safe-parse";
import {
	type TechCheckEmailResponse,
	type TechRefreshTokenResponse,
	type TechSignInResponse,
	type TechSignOutResponse,
	type TechSignUpResponse,
	techCheckEmailResponseSchema,
	techRefreshTokenResponseSchema,
	techSignInResponseSchema,
	techSignOutResponseSchema,
	techSignUpResponseSchema,
} from "../schemas/response.schema";
import type {
	TechnicianCheckEmailRequest,
	TechnicianSignInRequest,
} from "../types/technician-auth";

export async function technicianCheckEmail(
	data: TechnicianCheckEmailRequest,
): Promise<TechCheckEmailResponse> {
	const response = await apiClient.post(
		"/api/technician-auth/check-email",
		data,
	);
	return safeParseResponse(
		techCheckEmailResponseSchema,
		response.data,
		"technicianCheckEmail",
	);
}

export async function technicianSignIn(
	data: TechnicianSignInRequest,
): Promise<TechSignInResponse> {
	const response = await apiClient.post("/api/technician-auth/signin", data);
	return safeParseResponse(
		techSignInResponseSchema,
		response.data,
		"technicianSignIn",
	);
}

export async function technicianSignUp(
	formData: FormData,
): Promise<TechSignUpResponse> {
	const response = await apiClient.post(
		"/api/technician-auth/signup",
		formData,
		{ headers: { "Content-Type": "multipart/form-data" } },
	);
	return safeParseResponse(
		techSignUpResponseSchema,
		response.data,
		"technicianSignUp",
	);
}

export async function technicianSignOut(): Promise<TechSignOutResponse> {
	const response = await apiClient.post("/api/technician-auth/signout");
	return safeParseResponse(
		techSignOutResponseSchema,
		response.data,
		"technicianSignOut",
	);
}

export async function technicianRefreshSession(
	refreshToken: string,
): Promise<TechRefreshTokenResponse> {
	const response = await apiClient.post("/api/technician-auth/refresh", {
		refreshToken,
	});
	return safeParseResponse(
		techRefreshTokenResponseSchema,
		response.data,
		"technicianRefreshSession",
	);
}
