/** Shape of an address record returned by the API. */
export interface Address {
  id: string;
  created_at: string;
  user_id: string | null;
  technician_id: string | null;
  city: string;
  street: string;
  building_no: string | null;
  apartment_no: string | null;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
}

/** The server returns `{ addresses: Address[] }`. */
export interface AddressesResponse {
  addresses: Address[];
}

/** The server returns `{ address: Address }` on create/update/activate. */
export interface AddressResponse {
  address: Address;
}

/** Payload for creating a new address. */
export interface CreateAddressRequest {
  city: string;
  street: string;
  building_no?: string;
  apartment_no?: string;
  latitude: number;
  longitude: number;
}
