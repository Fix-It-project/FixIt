import { z } from "zod";

/** Zod form validation schema for the "Add New Address" form. */
export const addAddressSchema = z.object({
  city: z.string().min(1, "City is required"),
  street: z
    .string()
    .min(5, "Street address must be at least 5 characters")
    .max(200, "Street address must be less than 200 characters"),
  buildingNumber: z.string().optional().or(z.literal("")),
  apartmentNumber: z.string().optional().or(z.literal("")),
});

export type AddAddressFormData = z.infer<typeof addAddressSchema>;
