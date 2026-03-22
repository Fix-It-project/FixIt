import apiClient from "@/src/lib/api-client";
import { safeParseResponse } from "@/src/lib/helpers/safe-parse";
import type { Address } from "./schemas/response.schema";
import {
	addressesResponseSchema,
	addressResponseSchema,
} from "./schemas/response.schema";
import type { CreateAddressRequest } from "./types";

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
