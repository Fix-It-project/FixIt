import apiClient from "@/src/config/api-client";
import { safeParseResponse } from "@/src/lib/api/safe-parse";
import type { Address } from "../schemas/response.schema";
import {
	addressesResponseSchema,
	addressResponseSchema,
} from "../schemas/response.schema";
import type { CreateAddressRequest } from "../types/types";

export async function getUserAddresses(): Promise<Address[]> {
	const { data } = await apiClient.get("/api/addresses/user/addresses");
	return safeParseResponse(addressesResponseSchema, data, "getUserAddresses")
		.addresses;
}

export async function addUserAddress(
	payload: CreateAddressRequest,
): Promise<Address> {
	const { data } = await apiClient.post(
		"/api/addresses/user/addresses",
		payload,
	);
	return safeParseResponse(addressResponseSchema, data, "addUserAddress")
		.address;
}

export async function setActiveUserAddress(
	addressId: string,
): Promise<Address> {
	const { data } = await apiClient.patch(
		`/api/addresses/user/addresses/${addressId}/activate`,
	);
	return safeParseResponse(addressResponseSchema, data, "setActiveUserAddress")
		.address;
}

export async function deleteUserAddress(addressId: string): Promise<void> {
	await apiClient.delete(`/api/addresses/user/addresses/${addressId}`);
}

// ── Technician addresses (single work/service location) ──────────────────────

export async function getTechnicianAddresses(): Promise<Address[]> {
	const { data } = await apiClient.get("/api/addresses/technician/addresses");
	return safeParseResponse(
		addressesResponseSchema,
		data,
		"getTechnicianAddresses",
	).addresses;
}

export async function addTechnicianAddress(
	payload: CreateAddressRequest,
): Promise<Address> {
	const { data } = await apiClient.post(
		"/api/addresses/technician/addresses",
		payload,
	);
	return safeParseResponse(addressResponseSchema, data, "addTechnicianAddress")
		.address;
}

export async function updateTechnicianAddress(
	addressId: string,
	payload: Partial<CreateAddressRequest>,
): Promise<Address> {
	const { data } = await apiClient.put(
		`/api/addresses/technician/addresses/${addressId}`,
		payload,
	);
	return safeParseResponse(
		addressResponseSchema,
		data,
		"updateTechnicianAddress",
	).address;
}
