import apiClient from "@/src/lib/api-client";
import { addressesResponseSchema, addressResponseSchema } from "./schema";
import type {
  Address,
  AddressesResponse,
  AddressResponse,
  CreateAddressRequest,
} from "./types";

/**
 * Fetch all addresses for the authenticated user.
 * GET /api/addresses/user/addresses
 */
export async function getUserAddresses(): Promise<Address[]> {
  const { data } = await apiClient.get<AddressesResponse>(
    "/api/addresses/user/addresses",
  );
  const validated = addressesResponseSchema.parse(data);
  return validated.addresses;
}

/**
 * Create a new address (auto-set as active).
 * POST /api/addresses/user/addresses
 */
export async function addUserAddress(
  payload: CreateAddressRequest,
): Promise<Address> {
  const { data } = await apiClient.post<AddressResponse>(
    "/api/addresses/user/addresses",
    payload,
  );
  const validated = addressResponseSchema.parse(data);
  return validated.address;
}

/**
 * Set an existing address as the active one.
 * PATCH /api/addresses/user/addresses/:id/activate
 */
export async function setActiveUserAddress(
  addressId: string,
): Promise<Address> {
  const { data } = await apiClient.patch<AddressResponse>(
    `/api/addresses/user/addresses/${addressId}/activate`,
  );
  const validated = addressResponseSchema.parse(data);
  return validated.address;
}
