import { z } from "zod";

/** Zod schema for a single address object (API response validation). */
export const addressSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  user_id: z.string().nullable(),
  technician_id: z.string().nullable(),
  city: z.string(),
  street: z.string(),
  building_no: z.string().nullable(),
  apartment_no: z.string().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  is_active: z.boolean(),
});

/** Zod schema for the `GET /addresses` response. */
export const addressesResponseSchema = z.object({
  addresses: z.array(addressSchema),
});

/** Zod schema for the single-address response (create/update/activate). */
export const addressResponseSchema = z.object({
  address: addressSchema,
});

export type Address = z.infer<typeof addressSchema>;
export type AddressesResponse = z.infer<typeof addressesResponseSchema>;
export type AddressResponse = z.infer<typeof addressResponseSchema>;
