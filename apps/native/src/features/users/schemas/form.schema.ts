import { z } from "zod";

export const editProfileSchema = z
  .object({
    full_name: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name must be less than 100 characters")
      .optional()
      .or(z.literal("")),
    email: z.email("Please enter a valid email address").optional().or(z.literal("")),
    phone: z
      .string()
      .regex(/^[\d\s\-\+\(\)]+$/, "Please enter a valid phone number")
      .optional()
      .or(z.literal("")),
  })
  .refine((data) => !!data.full_name || !!data.email || !!data.phone, {
    message: "At least one field must be provided",
    path: ["full_name"],
  });

export type EditProfileFormData = z.infer<typeof editProfileSchema>;
