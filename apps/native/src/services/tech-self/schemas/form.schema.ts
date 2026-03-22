import { z } from "zod";

export const editTechProfileSchema = z
  .object({
    first_name: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name must be less than 50 characters")
      .optional()
      .or(z.literal("")),
    last_name: z
      .string()
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name must be less than 50 characters")
      .optional()
      .or(z.literal("")),
    phone: z
      .string()
      .regex(/^[\d\s\-\+\(\)]+$/, "Please enter a valid phone number")
      .optional()
      .or(z.literal("")),
    description: z
      .string()
      .max(300, "Description must be less than 300 characters")
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => !!data.first_name || !!data.last_name || !!data.phone || !!data.description,
    {
      message: "At least one field must be provided",
      path: ["first_name"],
    },
  );

export type EditTechProfileFormData = z.infer<typeof editTechProfileSchema>;
