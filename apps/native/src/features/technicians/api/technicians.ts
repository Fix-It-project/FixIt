import apiClient from "@/src/config/api-client";
import { safeParseResponse } from "@/src/lib/api/safe-parse";
import {
	type TechnicianListItem,
	type TechnicianProfile,
	type TechnicianService,
	technicianProfileResponseSchema,
	technicianServicesResponseSchema,
	techniciansResponseSchema,
} from "../schemas/response.schema";

export type TechniciansSortParam = "top_rated" | "most_reviews" | "nearest";

export interface TechnicianListPageParams {
	readonly limit?: number;
	readonly offset?: number;
}

export async function getTechniciansByCategory(
	categoryId: string,
	coords?: { latitude: number; longitude: number },
	sort?: TechniciansSortParam,
	page?: TechnicianListPageParams,
): Promise<TechnicianListItem[]> {
	const params: Record<string, string> = {};
	if (coords) {
		params.lat = String(coords.latitude);
		params.lng = String(coords.longitude);
	}
	if (sort) params.sort = sort;
	if (page?.limit != null) params.limit = String(page.limit);
	if (page?.offset != null) params.offset = String(page.offset);
	const { data } = await apiClient.get(
		`/api/categories/${categoryId}/technicians`,
		{ params },
	);
	return safeParseResponse(
		techniciansResponseSchema,
		data,
		"getTechniciansByCategory",
	).technicians;
}

export async function searchTechniciansInCategory(
	categoryId: string,
	query: string,
	coords?: { latitude: number; longitude: number },
	sort?: TechniciansSortParam,
	page?: TechnicianListPageParams,
): Promise<TechnicianListItem[]> {
	const params: Record<string, string> = { q: query };
	if (coords) {
		params.lat = String(coords.latitude);
		params.lng = String(coords.longitude);
	}
	if (sort) params.sort = sort;
	if (page?.limit != null) params.limit = String(page.limit);
	if (page?.offset != null) params.offset = String(page.offset);
	const { data } = await apiClient.get(
		`/api/categories/${categoryId}/technicians/search`,
		{ params },
	);
	return safeParseResponse(
		techniciansResponseSchema,
		data,
		"searchTechniciansInCategory",
	).technicians;
}

export async function getTechnicianProfile(
	technicianId: string,
): Promise<TechnicianProfile> {
	const { data } = await apiClient.get(
		`/api/technicians/${technicianId}/profile`,
	);
	return safeParseResponse(
		technicianProfileResponseSchema,
		data,
		"getTechnicianProfile",
	).profile;
}

export async function getTechnicianServices(
	technicianId: string,
): Promise<TechnicianService[]> {
	const { data } = await apiClient.get(
		`/api/technicians/${technicianId}/services`,
	);
	return safeParseResponse(
		technicianServicesResponseSchema,
		data,
		"getTechnicianServices",
	).services;
}
