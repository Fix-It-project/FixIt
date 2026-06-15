import apiClient from "@/src/config/api-client";
import { safeParseResponse } from "@/src/lib/api/safe-parse";
import {
	type CustomServiceRequest,
	myServiceRequestsResponseSchema,
	submitServiceRequestResponseSchema,
} from "../schemas/custom-service.schema";

export interface SubmitServiceRequestBody {
	name: string;
	description?: string | null;
	min_price: number;
	max_price: number;
}

/** Technician submits a custom-service request (POST /me/service-requests).
 *  Category is inherited server-side from the technician's profile. */
export async function submitServiceRequest(
	body: SubmitServiceRequestBody,
): Promise<CustomServiceRequest> {
	const { data } = await apiClient.post(
		"/api/technicians/me/service-requests",
		body,
	);
	return safeParseResponse(
		submitServiceRequestResponseSchema,
		data,
		"submitServiceRequest",
	).request;
}

/** The authenticated technician's own requests, with their review status. */
export async function getMyServiceRequests(): Promise<CustomServiceRequest[]> {
	const { data } = await apiClient.get("/api/technicians/me/service-requests");
	return safeParseResponse(
		myServiceRequestsResponseSchema,
		data,
		"getMyServiceRequests",
	).requests;
}
