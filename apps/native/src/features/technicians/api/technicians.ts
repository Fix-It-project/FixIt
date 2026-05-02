import apiClient from "@/src/lib/api-client";
import { safeParseResponse } from "@/src/lib/helpers/safe-parse";
import {
	type TechnicianListItem,
	type TechnicianProfile,
	technicianProfileResponseSchema,
	techniciansResponseSchema,
} from "../schemas/response.schema";

export type TechniciansSortParam = "top_rated" | "most_reviews";

export async function getTechniciansByCategory(
	categoryId: string,
	coords?: { latitude: number; longitude: number },
	sort?: TechniciansSortParam,
): Promise<TechnicianListItem[]> {
	const params: Record<string, string> = {};
	if (coords) {
		params.lat = String(coords.latitude);
		params.lng = String(coords.longitude);
	}
	if (sort) params.sort = sort;
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
): Promise<TechnicianListItem[]> {
	const params: Record<string, string> = { q: query };
	if (coords) {
		params.lat = String(coords.latitude);
		params.lng = String(coords.longitude);
	}
	if (sort) params.sort = sort;
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
