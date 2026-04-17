import { z } from 'zod';

export const AddressBodySchema = z.object({
  city: z.string().min(1, 'City is required'),
  street: z.string().min(1, 'Street is required'),
  building_no: z.string().optional(),
  apartment_no: z.string().optional(),
  latitude: z.number({ error: 'Latitude must be a number' }),
  longitude: z.number({ error: 'Longitude must be a number' }),
});

export const AddressUpdateBodySchema = AddressBodySchema.partial();

export const AddressIdParamsSchema = z.object({
  id: z.string().uuid('Address ID must be a valid UUID'),
});

export type AddressBody = z.infer<typeof AddressBodySchema>;
export type AddressUpdateBody = z.infer<typeof AddressUpdateBodySchema>;
export type AddressIdParams = z.infer<typeof AddressIdParamsSchema>;
