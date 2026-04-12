export interface CreateAddressRequest {
  city: string;
  street: string;
  building_no?: string;
  apartment_no?: string;
  latitude: number;
  longitude: number;
}
